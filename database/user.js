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
    nickyname: {
        type: Sequelize.STRING
    },
    gender: {
        type: Sequelize.STRING
    },
    password: {
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
    },
    cart: {
        type: Sequelize.JSON
    },
    record: {
        type: Sequelize.JSON
    }
})

// User.sync({ force: true })
//     .then(() => {
//         User.create({
//                 username: 'test1',
//                 nickyname: '灵魂治愈',
//                 gender: 'male',
//                 password: '123456',
//                 address: '海南省文昌市&&高隆湾',
//                 phone: '123456789',
//                 contract: 'xxx',
//                 cart: [{ xx: 123 }, { xx: 123 }, { xx: 123 }],
//                 record: [{ xx: 123 }, { xx: 123 }, { xx: 123 }]
//             })
//             .then(res => {
//                 console.log(res.toJSON())
//             })
//     })

module.exports = User