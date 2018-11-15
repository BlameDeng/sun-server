'use strict'
const Router = require('koa-router')
const router = new Router()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('../database/user.js')
const Record = require('../database/record.js')
const key = require('./key.js')

function encrypt(params) {
    const hmac = crypto.createHmac('sha256', key.hmac_key)
    hmac.update(params)
    return hmac.digest('hex')
}

function jwtSign(params) {
    return jwt.sign(params, key.jwt_key, { expiresIn: '1h' })
}

async function getRecord(id) {
    return await Record.findAll({ where: { uid: id } }).then(res => {
        let results = []
        res.forEach(item => {
            results.push(item.toJSON())
        })
        return results
    })
}

const login = async (ctx, next) => {
    let data = ctx.request.body
    let result = await User.findOne({ where: { username: data.username } })
    ctx.response.status = 200
    if (result) {
        let { id, username, nickyname, password, gender, address, detailAddress, phone, contract, cart } = result.toJSON()
        let record = await getRecord(id)
        if (encrypt(data.password) === password) {
            let token = jwtSign({ username, id })
            ctx.response.body = { status: 'success', msg: '登录成功', isLogin: true, token, data: { username, nickyname, gender, address, detailAddress, phone, contract, cart, record } }
        } else {
            ctx.response.body = { status: 'fail', msg: '密码不正确', isLogin: false }
        }
    } else {
        let password = encrypt(data.password)
        await User.create({ username: data.username, password })
        let user = await User.findOne({ where: { username: data.username } }).then(user => user.toJSON())
        let { id, username, nickyname, gender, address, detailAddress, phone, contract, cart } = user
        let record = await getRecord(id)
        let token = jwtSign({ username, id })
        ctx.response.body = { status: 'success', msg: '注册成功', isLogin: true, token, data: { username, nickyname, gender, address, detailAddress, phone, contract, cart, record } }
    }
}

const check = async (ctx, next) => {
    ctx.response.status = 200
    let user = await User.findById(ctx.state.user.id).then(user => {
        if (user) {
            return user.toJSON()
        } else {
            return false
        }
    })
    if (user) {
        let { id, username, nickyname, gender, address, detailAddress, phone, contract, cart } = user
        let record = await getRecord(id)
        ctx.response.body = {
            status: 'success',
            msg: '验证成功，用户已登录',
            isLogin: true,
            data: { username, nickyname, gender, address, detailAddress, phone, contract, cart, record }
        }
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '验证失败，用户不存在',
            isLogin: false
        }
    }
}

const logout = async (ctx, next) => {
    ctx.response.status = 200
    ctx.response.body = { status: 'success', msg: '注销成功', isLogin: false }
}

const patchPassword = async (ctx, next) => {
    ctx.response.status = 200
    let { username, password, newPassword } = ctx.request.body
    let oldPassword = encrypt(password)
    let user = await User.findOne({ where: { username } }).then(user => user.toJSON())
    //用户存在
    if (user) {
        let { password } = user
        //密码匹配
        if (password === oldPassword) {
            let result = await User.update({ password: encrypt(newPassword) }, { where: { username } })
            //修改成功
            if (result[0]) {
                ctx.response.body = {
                    status: 'success',
                    msg: '密码修改成功'
                }
                //修改失败
            } else {
                ctx.response.body = {
                    status: 'fail',
                    msg: '系统异常，修改失败'
                }
            }
            //密码不匹配
        } else {
            ctx.response.body = {
                status: 'fail',
                msg: '密码不正确'
            }
        }
        //用户不存在
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '用户不存在'
        }
    }
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
            let record = await getRecord(id)
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
            let record = await getRecord(id)
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
    let record = await getRecord(id)
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
router.post('/patchpassword', patchPassword)
router.post('/patchprofile', patchProfile)
router.post('/patchaddress', patchAddress)
router.post('/pay', pay)

module.exports = router