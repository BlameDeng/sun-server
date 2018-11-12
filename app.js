'use strict'
const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('koa-router')
const cors = require('koa2-cors')
const koajwt = require('koa-jwt')

const key = require('./routes/key.js')
const auth = require('./routes/auth.js')
const api = require('./routes/api.js')

const app = new Koa()
app.use(cors())

const router = new Router()

app.use((ctx, next) => {
    return next().catch(error => {
        if (error.status === 401) {
            if (ctx.url === '/auth/check') {
                ctx.response.status = 200
                ctx.response.body = {
                    status: 'fail',
                    msg: '用户未登录',
                    isLogin: false
                }
            } else {
                ctx.response.status = 401
                ctx.response.body = {
                    status: 'fail',
                    msg: '无权限（未登录）',
                    isLogin: false
                }
            }
        } else {
            throw error
        }
    })
})

router.use('/auth', auth.routes())
router.use('/api', api.routes())

app.use(koajwt({ secret: key.jwt_key }).unless({ path: ['/auth/login'] }))
app.use(koaBody({ multipart: true, strict: false }))
app.use(router.routes())
const port = 8989
app.listen(port, () => {
    console.log(`Koa2开始监听${port}端口`)
})