'use strict'
const path = require('path')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(undefined, undefined, undefined, {
    host: 'localhost',
    dialect: 'sqlite',
    storage: path.join(__dirname, './record.sqlite')
})

const Record = sequelize.define('record', {
    uid: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING
    },
    goods: {
        type: Sequelize.JSON
    }
})

// Record.sync({ force: true })
//     .then(() => {
//         Record.create({
//                 uid: 'xxx',
//                 status: 'payed',
//                 goods: { xx: 123 }
//             })
//             .then(res => {
//                 console.log(res.toJSON())
//             })
//     })

module.exports = Record