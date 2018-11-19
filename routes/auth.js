'use strict'
const Router = require('koa-router')
const router = new Router()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('../database/user')
const Cart = require('../database/cart')
const Product = require('../database/product')
const Record = require('../database/record.js')
const key = require('./key.js')
//加密
function encrypt(params) {
    const hmac = crypto.createHmac('sha256', key.hmac_key)
    hmac.update(params)
    return hmac.digest('hex')
}
//签名
function jwtSign(params) {
    return jwt.sign(params, key.jwt_key, { expiresIn: '1h' })
}

async function getRecordByUid(uid) {
    return await Record.findAll({ where: { uid } }).then(res => {
        let results = []
        res.forEach(item => {
            results.push(item.toJSON())
        })
        return results
    })
}
//获取购物车信息
async function getCartInfo(uid) {
    let cart = await Cart.findOne({ where: { uid } })
    if (cart) {
        return await getDetail(cart.toJSON())
    } else {
        let temp = await Cart.create({ uid, products: [] }).then(cart => cart.toJSON())
        return await getDetail(temp)
    }
}
async function getDetail(cart) {
    let detail = []
    for (let i = 0; i < cart.products.length; i++) {
        let item = cart.products[i]
        let product = await Product.findById(item.id).then(res => {
            if (res) {
                return res.toJSON()
            } else {
                return {}
            }
        })
        detail.push({ count: item.count, ...product })
    }
    cart.products=detail
    return cart
}
//注册
async function register(username, password) {
    let userPassword = encrypt(password)
    let user = await User.create({ username, password: userPassword, nickyname: '', gender: '' })
    return user.toJSON()
}
//登录
const login = async (ctx, next) => {
    let data = ctx.request.body
    let user = await User.findOne({ where: { username: data.username } })
    ctx.response.status = 200
    if (user) {
        let { id, username, nickyname, gender, password } = user.toJSON()
        if (encrypt(data.password) === password) {
            let token = jwtSign({ id, username })
            let cart = await getCartInfo(id)
            ctx.response.body = { status: 'success', isLogin: true, token, data: { username, nickyname, gender, cart } }
        } else {
            ctx.response.body = { status: 'fail', msg: '密码不正确', isLogin: false }
        }
    } else {
        let user = await register(data.username, data.password)
        let { id, username, nickyname, gender } = user
        let token = jwtSign({ id, username })
        let cart = await getCartInfo(id)
        ctx.response.body = { status: 'success', isLogin: true, token, data: { username, nickyname, gender, cart } }
    }
}
//检查登录
const check = async (ctx, next) => {
    ctx.response.status = 200
    let user = await User.findById(ctx.state.user.id)
    if (user) {
        let { id, username, nickyname, gender } = user.toJSON()
        let cart = await getCartInfo(id)
        ctx.response.body = { status: 'success', isLogin: true, data: { username, nickyname, gender, cart } }
    } else {
        ctx.response.body = { status: 'fail', msg: '用户不存在', isLogin: false }
    }
}
//登出
const logout = async (ctx, next) => {
    ctx.response.status = 200
    ctx.response.body = { status: 'success', msg: '注销成功', isLogin: false }
}
//修改密码
const changePassword = async (ctx, next) => {
    ctx.response.status = 200
    let id = ctx.state.user.id
    let user = await User.findById(id)
    if (!user) {
        ctx.response.body = { status: 'fail', msg: '用户不存在' }
        return
    }
    let { password: oldPassword, newPassword } = ctx.request.body
    let { password } = user.toJSON()
    if (encrypt(oldPassword) !== password) {
        ctx.response.body = { status: 'fail', msg: '原密码不正确' }
        return
    }
    await User.update({ password: encrypt(newPassword) }, { where: { id } })
    ctx.response.body = { status: 'success' }
}
//修改资料
const changeProfile = async (ctx, next) => {
    ctx.response.status = 200
    let id = ctx.state.user.id
    let user = await User.findById(id)
    if (!user) {
        ctx.response.body = { status: 'fail', msg: '用户不存在' }
        return
    }
    let { nickyname, gender } = ctx.request.body
    let { username } = user.toJSON()
    let cart = await getCartInfo(id)
    await User.update({ nickyname, gender }, { where: { id } })
    ctx.response.body = { status: 'success', data: { username, nickyname, gender, cart } }
}

router.post('/login', login)
router.get('/check', check)
router.get('/logout', logout)
router.patch('/changepassword', changePassword)
router.patch('/changeprofile', changeProfile)

module.exports = router