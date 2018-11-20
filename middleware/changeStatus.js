const Order = require('../database/order')
async function changeStatus(id, status) {
    return await Order.update({ status }, { where: { id } })
}