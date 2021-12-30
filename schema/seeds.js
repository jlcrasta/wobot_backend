const mongoose = require('mongoose')
//const userSchema = require('./userSchema')
//const productSchema = require('./productSchema')

mongoose.connect('mongodb://localhost:27017/wobot', { useNewUrlParser: true })
    .then(() => {
        console.log('connected to database server!!')
    })
    .catch(err => {
        console.log('error in connected !!!')
        console.log(err);
    })

//seeds for fake user

/*
user.insertMany([
    { firstName: 'Joyson', lastName: 'Crasta', userName: 'joyCrasta', password: '123456' }
]).then(data => {
    console.log('seeds installed')
    console.log(data)
})*/

//seeds for fake products

/*
product.insertMany([
    { productName: 'wheat', description: 'good for health', quantity: 50, price: 30, user: "61cc0be79e8579739e4e38c2" },
    { productName: 'ragi', description: 'cools body down', quantity: 67, price: 50, user: "61cc0be79e8579739e4e38c2" },
    { productName: 'jower', description: 'good for muscels', quantity: 80, price: 60, user: "61cc0be79e8579739e4e38c2" }
])*/
