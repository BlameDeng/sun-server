'use strict'
const Router = require('koa-router')
const router = new Router()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('../database/user.js')
const key = require('./key.js')

function encrypt(params) {
    const hmac = crypto.createHmac('sha256', key.hmac_key)
    hmac.update(params)
    return hmac.digest('hex')
}

function jwtSign(params) {
    return jwt.sign(params, key.jwt_key, { expiresIn: '1h' })
}

const login = async (ctx, next) => {
    let data = ctx.request.body
    let result = await User.findOne({ where: { username: data.username } })
    ctx.response.status = 200
    if (result) {
        let { id, username, nickyname, password, gender, address, phone, contract, cart, record } = result.toJSON()
        if (encrypt(data.password) === password) {
            let token = jwtSign({ username, id })
            ctx.response.body = { status: 'success', msg: '登录成功', isLogin: true, token, data: { username, nickyname, gender, address, phone, contract, cart, record } }
        } else {
            ctx.response.body = { status: 'fail', msg: '密码不正确', isLogin: false }
        }
    } else {
        let password = encrypt(data.password)
        await User.create({ username: data.username, password })
        let user = await User.findOne({ where: { username: data.username } }).then(user => user.toJSON())
        let { id, username, nickyname, gender, address, phone, contract, cart, record } = user
        let token = jwtSign({ username, id })
        ctx.response.body = { status: 'success', msg: '注册成功', isLogin: true, token, data: { username, nickyname, gender, address, phone, contract, cart, record } }
    }
}

const check = async (ctx, next) => {
    ctx.response.status = 200
    if (ctx.state && ctx.state.user) {
        let user = await User.findById(ctx.state.user.id).then(user => user.toJSON())
        if (user) {
            let { id, username, nickyname, gender, address, phone, contract, cart, record } = user
            ctx.response.body = {
                status: 'success',
                msg: '验证成功，用户已登录',
                isLogin: true,
                data: { username, nickyname, gender, address, phone, contract, cart, record }
            }
        } else {
            ctx.response.body = {
                status: 'fail',
                msg: '验证失败，用户不存在',
                isLogin: false
            }
        }
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '验证失败，用户未登录',
            isLogin: false
        }
    }
}
router.post('/login', login)
router.get('/check', check)

module.exports = router

// username: 'blame',
// nickyname: '灵魂治愈',
// gender: 'male',
// password: '123456',
// payword: '123456',
// address: '海南省文昌市&&高隆湾',
// phone: '19808985650',
// contract: '邓麟',
// cart: [ { xx: 123 }, { xx: 123 }, { xx: 123 } ],
// record: [ { xx: 123 }, { xx: 123 }, { xx: 123 } ],