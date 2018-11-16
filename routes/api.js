'use strict'
const Router = require('koa-router')
const router = new Router()
const Leancloud = require('../utils/leancloud.js')
const Goods = new Leancloud('Goods')
const User = require('../database/user.js')
const Record = require('../database/record.js')

async function getRecord(id) {
    return await Record.findAll({ where: { uid: id } }).then(res => {
        let results = []
        res.forEach(item => {
            results.push(item.toJSON())
        })
        return results
    })
}

const fetchGoods = async (ctx, next) => {
    ctx.response.status = 200
    let query = ctx.request.query
    //有id 只获取单个商品
    if (query.id) {
        let goods = await Goods.fetchById(query.id)
            .then(res => {
                let { id, createdAt, updatedAt, attributes } = res
                return { id, createdAt, updatedAt, attributes }
            })
            .catch(error => {
                return null
            })
        if (goods) {
            ctx.response.body = {
                status: 'success',
                msg: '获取商品信息成功',
                data: goods
            }
        } else {
            ctx.response.body = { status: 'fail', msg: '获取商品信息失败' }
        }
        return
    }
    //否则获取全部
    let allGoods = []
    await Goods.fetchAll().then(res => {
        res.forEach(item => {
            let { id, createdAt, updatedAt, attributes } = item
            allGoods.push({ id, createdAt, updatedAt, attributes })
        })
    })
    //新到
    if (query.type === 'newArrival') {
        ctx.response.body = {
            status: 'success',
            msg: '获取新到商品信息成功',
            data: allGoods.slice(allGoods.length - 3)
        }
        //全部
    } else if (query.type === 'all') {
        ctx.response.body = {
            status: 'success',
            msg: '获取全部商品信息成功',
            data: allGoods
        }
        //推荐
    } else if (query.type === 'recommend') {
        if (query.gender === 'male' || query.gender === 'female') {
            let recommendGoods = allGoods.filter(
                goods => goods.attributes.category === query.gender
            )
            let length = recommendGoods.length
            if (length > 3) {
                //截取最后三项
                recommendGoods = recommendGoods.slice(length - 3)
            }
            ctx.response.body = {
                status: 'success',
                msg: '获取推荐商品信息成功',
                data: recommendGoods
            }
        } else {
            ctx.response.body = {
                status: 'success',
                msg: '获取推荐商品信息成功',
                data: allGoods.slice(allGoods.length - 3)
            }
        }
    }
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
            let user = await User.findById(ctx.state.user.id).then(user =>
                user.toJSON()
            )
            let {
                id,
                username,
                nickyname,
                gender,
                address,
                detailAddress,
                phone,
                contract,
                cart
            } = user
            let record = await getRecord(id)
            ctx.response.body = {
                status: 'success',
                msg: '已成功添加至购物车',
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
        let changed = false
        //购物车中已有商品则改变数量
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id === data.id) {
                cart[i].count = data.count
                changed = true
                break
            }
        }
        //没有则添加
        if (!changed) {
            cart.push(data)
        }
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
                cart
            } = user
            let record = await getRecord(id)
            ctx.response.body = {
                status: 'success',
                msg: '已成功修改数量',
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
            let {
                username,
                nickyname,
                gender,
                address,
                detailAddress,
                phone,
                contract,
                cart
            } = user
            let record = await getRecord(id)
            ctx.response.body = {
                status: 'success',
                msg: '已从购物车中删除',
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

const delivery = async (ctx, next) => {
    ctx.response.status = 200
    let { id, uid } = ctx.request.body
    let record = await Record.findById(id).then(res => res.toJSON())
    if (record) {
        let result = await Record.update({ status: 'toEvaluate' }, { where: { id } })
        if (result[0]) {
            let user = await User.findById(uid).then(user => user.toJSON())
            let {
                username,
                nickyname,
                gender,
                address,
                detailAddress,
                phone,
                contract,
                cart
            } = user
            let record = await getRecord(uid)
            ctx.response.body = {
                status: 'success',
                msg: '已从购物车中删除',
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
            ctx.response.body = { status: 'fail', msg: '系统异常' }
        }
    } else {
        ctx.response.body = { status: 'fail', msg: '订单不存在' }
    }
}

router.get('/fetchgoods', fetchGoods)
router.post('/addtocart', addToCart)
router.post('/changecount', changeCount)
router.post('/removegoods', removeGoods)
router.post('/delivery', delivery)

module.exports = router