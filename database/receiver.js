'use strict'
const path = require('path')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(undefined, undefined, undefined, {
    host: 'localhost',
    dialect: 'sqlite',
    storage: path.join(__dirname, './data/receiver.sqlite')
})

const Receiver = sequelize.define('receiver', {
    uid: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    phone: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    detail: {
        type: Sequelize.STRING
    }
})

// Receiver.sync({ force: true })
//     .then(() => {
//         Receiver.create({
//                 uid: '333',
//                 name: '222',
//                 phone: '2222',
//                 address: '000',
//                 detail: 'aaa'
//             })
//             .then(res => {
//                 console.log(res.toJSON())
//             })
//     })

module.exports = Receiver