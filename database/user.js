'use strict'
const path = require('path')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(undefined, undefined, undefined, {
    host: 'localhost',
    dialect: 'sqlite',
    storage: path.join(__dirname, './user.sqlite')
})

const User = sequelize.define('user', {
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    payword: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    phone: {
        type: Sequelize.STRING
    },
    contract: {
        type: Sequelize.STRING
    }
})

// User.sync({ force: true })
//     .then(() => {
//         User.create({
//                 username: 'blame',
//                 password: '123456',
//                 payword: '123456',
//                 address: '海南省文昌市',
//                 phone: '19808985650',
//                 contract: '邓麟'
//             })
//             .then(res => {
//                 console.log(res.toJSON())
//             })
//     })

module.exports = User