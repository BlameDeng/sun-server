'use strict'
const Router = require('koa-router')
const router = new Router()
const Leancloud = require('../utils/leancloud.js')
const Goods = new Leancloud('Goods')
const User = require('../database/user.js')

const newArrival = async (ctx, next) => {
    ctx.response.status = 200
    let allGoods = []
    await Goods.fetchAll().then(res => {
        res.forEach(item => {
            let { id, createdAt, updatedAt, attributes } = item
            allGoods.push({ id, createdAt, updatedAt, attributes })
        })
        ctx.response.body = { status: 'success', msg: '获取成功', data: allGoods.slice(allGoods.length - 3) }
    })
}

const addToCart = async (ctx, next) => {
    ctx.response.status = 200
    let data = ctx.request.body
    let user = await User.findById(ctx.state.user.id).then(user => user.toJSON())
    if (user) {
        let { cart } = user
        cart = cart || []
        let goods = cart.find(item => item.id === data.id)
        //购物车中已有商品则不做操作，否则添加新商品
        if (!goods) {
            cart.push(data)
        }
        let result = await User.update({ cart }, { where: { id: ctx.state.user.id } })
        if (result[0]) {
            let user = await User.findById(ctx.state.user.id).then(user => user.toJSON())
            let { id, username, nickyname, gender, address, detailAddress, phone, contract, cart, record } = user
            ctx.response.body = {
                status: 'success',
                msg: '已成功添加至购物车',
                isLogin: true,
                data: { username, nickyname, gender, address, detailAddress, phone, contract, cart, record }
            }
        } else {
            ctx.response.body = {
                status: 'fail',
                msg: '系统异常，添加失败',
                isLogin: true
            }
        }
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '用户不存在',
            isLogin: false
        }
    }
}

const changeCount = async (ctx, next) => {
    ctx.response.status = 200
    let { id } = ctx.state.user
    let data = ctx.request.body
    let user = await User.findById(id).then(user => user.toJSON())
    if (user) {
        let { cart } = user
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id === data.id) {
                cart[i].count = data.count
                break
            }
        }
        let result = await User.update({ cart }, { where: { id } })
        if (result[0]) {
            let user = await User.findById(id).then(user => user.toJSON())
            let { username, nickyname, gender, address, detailAddress, phone, contract, cart, record } = user
            ctx.response.body = {
                status: 'success',
                msg: '已成功修改数量',
                isLogin: true,
                data: { username, nickyname, gender, address, detailAddress, phone, contract, cart, record }
            }
        } else {
            ctx.response.body = {
                status: 'fail',
                msg: '系统异常，添加失败',
                isLogin: true
            }
        }
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '用户不存在',
            isLogin: false
        }
    }
}

const removeGoods = async (ctx, next) => {
    ctx.response.status = 200
    let { id } = ctx.state.user
    let data = ctx.request.body
    let user = await User.findById(id).then(user => user.toJSON())
    if (user) {
        let { cart } = user
        cart = cart.filter(goods => goods.id !== data.id)
        let result = await User.update({ cart }, { where: { id } })
        if (result[0]) {
            let user = await User.findById(id).then(user => user.toJSON())
            let { username, nickyname, gender, address, detailAddress, phone, contract, cart, record } = user
            ctx.response.body = {
                status: 'success',
                msg: '已从购物车中删除',
                isLogin: true,
                data: { username, nickyname, gender, address, detailAddress, phone, contract, cart, record }
            }
        } else {
            ctx.response.body = {
                status: 'fail',
                msg: '系统异常，添加失败',
                isLogin: true
            }
        }
    } else {
        ctx.response.body = {
            status: 'fail',
            msg: '用户不存在',
            isLogin: false
        }
    }
}










router.get('/newarrival', newArrival)
router.post('/addtocart', addToCart)
router.post('/changecount', changeCount)
router.post('/removegoods', removeGoods)
module.exports = router