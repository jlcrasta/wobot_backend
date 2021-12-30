const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }]

})

const product = mongoose.model('product', productSchema)

module.exports = product;