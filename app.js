'use strict'
const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('koa-router')
const cors = require('koa2-cors')

const auth = require('./routes/auth.js')
const api = require('./routes/api.js')

const app = new Koa()
app.use(cors())
const router = new Router()
router.use('/auth', auth.routes())
router.use('/api', api.routes())

app.use(koaBody({ multipart: true, strict: false }))
app.use(router.routes())
const port = 8989
app.listen(port, () => {
    console.log(`Koa2开始监听${port}端口`)
})