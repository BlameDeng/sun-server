'use strict'
const Router = require('koa-router')
const router = new Router()
const crypto = require('crypto')

const User = require('../database/user.js')
const key = require('./key.js')

function encrypt(params) {
    const hmac = crypto.createHmac('sha256', key.hmac_key)
    hmac.update(params)
    return hmac.digest('hex')
}

const login = async (ctx, next) => {
    let data = ctx.request.body
    let result = await User.findOne({ where: { username: data.username } })
    ctx.response.status = 200
    if (result) {
        let { username, password, address, phone, contract } = result.toJSON()
        if (encrypt(data.password) === password) {
            ctx.response.body = { status: 'success', msg: '登录成功', data: { username, address, phone, contract } }
        } else {
            ctx.response.body = { status: 'fail', msg: '密码不正确' }
        }
    } else {
        let password = encrypt(data.password)
        let user = await User.create({ username: data.username, password }).then(user => {
            return user.toJSON()
        })
        let { username, address, phone, contract } = user
        ctx.response.body = { status: 'success', msg: '注册成功', data: { username, address, phone, contract } }
    }
}

router.post('/login', login)

module.exports = router