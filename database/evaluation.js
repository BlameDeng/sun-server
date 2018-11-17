'use strict'
const path = require('path')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(undefined, undefined, undefined, {
    host: 'localhost',
    dialect: 'sqlite',
    storage: path.join(__dirname, './evaluation.sqlite')
})

const Evaluation = sequelize.define('evaluation', {
    rid: {
        type: Sequelize.STRING
    },
    gid: {
        type: Sequelize.STRING
    },
    uid: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    nickyname: {
        type: Sequelize.STRING
    },
    content: {
        type: Sequelize.STRING
    }
})

// Evaluation.sync({ force: true })
//     .then(() => {
//         Evaluation.create({
//                 rid: 'xxx',
//                 gid: 'xxx',
//                 uid: 'xxx',
//                 username: 'xxx',
//                 nickyname: 'xxx',
//                 content: 'xxx'
//             })
//             .then(res => {
//                 console.log(res.toJSON())
//             })
//     })

module.exports = Evaluation