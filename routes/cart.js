'use strict'
const Router = require('koa-router')
const Cart = require('../database/cart')

const router = new Router()

const addToCart = async (ctx, next) => {
    ctx.response.status = 200
    let { id, count } = ctx.request.body
    let uid = ctx.state.user.id
    let result = await Cart.findOne({ where: { uid } }).then(cart => cart.toJSON())
    let products = result.products
    let sku = products.filter(item => item.id === id)
    if (sku.length) {
        let index = products.indexOf(sku)
        products.splice(index, 1, { id, count })
    } else {
        products.push({ id, count })
    }
    await Cart.update({ products }, { where: { uid } })
    let cart = await Cart.findOne({ where: { uid } }).then(cart => cart.toJSON())
    ctx.response.body = { status: 'success', data: cart }
}

const removeFromCart = async (ctx, next) => {
    ctx.response.status = 200
    let { id } = ctx.request.body
    let uid = ctx.state.user.id
    let result = await Cart.findOne({ where: { uid } }).then(cart => cart.toJSON())
    let products = result.products.filter(item => item.id !== id)
    await Cart.update({ products }, { where: { uid } })
    let cart = await Cart.findOne({ where: { uid } }).then(cart => cart.toJSON())
    ctx.response.body = { status: 'success', data: cart }
}

const changeProductCount = async (ctx, next) => {
    ctx.response.status = 200
    let { id, count } = ctx.request.body
    if (count < 1) {
        ctx.response.body = { status: 'fail', msg: '数量不能小于1' }
    }
    let uid = ctx.state.user.id
    let result = await Cart.findOne({ where: { uid } }).then(cart => cart.toJSON())
    let products = result.products
    let sku = products.filter(item => item.id === id)
    let index = products.indexOf(sku)
    products.splice(index, 1, { id, count })
    await Cart.update({ products }, { where: { uid } })
    let cart = await Cart.findOne({ where: { uid } }).then(cart => cart.toJSON())
    ctx.response.body = { status: 'success', data: cart }
}

router.patch('/addtocart', addToCart)
router.patch('/removefromcart', removeFromCart)
router.patch('/changeproductcount', changeProductCount)

module.exports = router