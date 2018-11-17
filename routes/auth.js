'use strict'
const Router = require('koa-router')
const router = new Router()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('../database/user.js')
const Record = require('../database/record.js')
const key = require('./key.js')

const Sequelize = require('sequelize')

function encrypt(params) {
    const hmac = crypto.createHmac('sha256', key.hmac_key)
    hmac.update(params)
    return hmac.digest('hex')
}

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
            ctx.response.body = { status: 'success', isLogin: true, token, data: { username, nickyname, gender } }
        } else {
            ctx.response.body = { status: 'fail', msg: '密码不正确', isLogin: false }
        }
    } else {
        let user = await register(data.username, data.password)
        let { id, username, nickyname, gender } = user
        let token = jwtSign({ id, username })
        ctx.response.body = { status: 'success', isLogin: true, token, data: { username, nickyname, gender } }
    }
}
//检查登录
const check = async (ctx, next) => {
    ctx.response.status = 200
    let user = await User.findById(ctx.state.user.id)
    if (user) {
        let { username, nickyname, gender } = user.toJSON()
        ctx.response.body = { status: 'success', isLogin: true, data: { username, nickyname, gender } }
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

const patchProfile = async (ctx, next) => {
    ctx.response.status = 200
    let { nickyname, gender } = ctx.request.body
    let { id } = ctx.state.user
    let user = await User.findById(id).then(user => user.toJSON())
    if (user) {
        let result = await User.update({ nickyname, gender }, { where: { id } })
        if (result[0]) {
            let user = await User.findById(id).then(user => user.toJSON())
            let { username, nickyname, gender, address, detailAddress, phone, contract, cart } = user
            let record = await getRecordByUid(id)
            ctx.response.body = {
                status: 'success',
                msg: '修改成功',
                isLogin: true,
                data: { username, nickyname, gender, address, detailAddress, phone, contract, cart, record }
            }
        } else {
            ctx.response.body = {
                status: 'fail',
                msg: '系统异常，修改失败'
            }
        }
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '用户不存在'
        }
    }
}

const patchAddress = async (ctx, next) => {
    ctx.response.status = 200
    let { id } = ctx.state.user
    let user = await User.findById(id).then(user => user.toJSON())
    if (user) {
        let result = await User.update({ ...ctx.request.body }, { where: { id } })
        if (result[0]) {
            let user = await User.findById(id).then(user => user.toJSON())
            let { username, nickyname, gender, address, detailAddress, phone, contract, cart } = user
            let record = await getRecordByUid(id)
            ctx.response.body = {
                status: 'success',
                msg: '修改成功',
                isLogin: true,
                data: { username, nickyname, gender, address, detailAddress, phone, contract, cart, record }
            }
        } else {
            ctx.response.body = {
                status: 'fail',
                msg: '系统异常，修改失败'
            }
        }
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '用户不存在'
        }
    }
}

const pay = async (ctx, next) => {
    ctx.response.status = 200
    let data = ctx.request.body
    //data:{order,password}
    let id = ctx.state.user.id
    let user = await User.findById(id).then(user => user.toJSON())
    if (!user) {
        ctx.response.body = { status: 'fail', msg: '用户不存在' }
        return
    }
    if (encrypt(data.password) !== user.password) {
        ctx.response.body = { status: 'fail', msg: '密码不正确' }
        return
    }
    let { cart } = user
    let order = data.order
    const ids = []
    const promises = []
    order.forEach(goods => {
        ids.push(goods.id)
        promises.push(Record.create({ uid: id, status: 'payed', goods }))
    })
    await Promise.all(promises).catch(error => {
        ctx.response.body = { status: 'fail', msg: '系统异常' }
        return
    })
    let record = await getRecordByUid(id)
    cart = cart.filter(goods => {
        if (ids.indexOf(goods.id) === -1) {
            return goods
        }
    })
    let result = await User.update({ cart }, { where: { id } })
    if (result[0]) {
        let user = await User.findById(id).then(user => user.toJSON())
        let {
            username,
            nickyname,
            gender,
            address,
            detailAddress,
            phone,
            contract,
            cart,
        } = user
        ctx.response.body = {
            status: 'success',
            msg: '支付成功',
            isLogin: true,
            data: {
                username,
                nickyname,
                gender,
                address,
                detailAddress,
                phone,
                contract,
                cart,
                record
            }
        }
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '系统异常，支付失败',
            isLogin: true
        }
    }
}

router.post('/login', login)
router.get('/check', check)
router.get('/logout', logout)
router.patch('/changepassword', changePassword)
router.post('/patchprofile', patchProfile)
router.post('/patchaddress', patchAddress)
router.post('/pay', pay)

module.exports = router