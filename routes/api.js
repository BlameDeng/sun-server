'use strict'
const Router = require('koa-router')
const router = new Router()
const Leancloud = require('../utils/leancloud.js')
const Goods = new Leancloud('Goods')

const newArrival = async (ctx, next) => {
    ctx.response.status = 200
    let allGoods = []
    await Goods.fetchAll().then(res => {
        res.forEach(item => {
            let { id, createdAt, updatedAt, attributes } = item
            allGoods.push({ id, createdAt, updatedAt, ...attributes })
        })
        ctx.response.body = { status: 'success', msg: '获取成功', data: allGoods.slice(allGoods.length - 3) }
    })
}















router.get('/newarrival', newArrival)
module.exports = router