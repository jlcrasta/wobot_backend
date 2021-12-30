if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express')
const app = express();
const PORT = 5500;
const path = require('path');
//const ejs = require('ejs')
const mongoose = require('mongoose')
const User = require('./schema/userSchema')
const Products = require('./schema/productSchema')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const csvtojson = require('csvtojson');
const flash = require('connect-flash')
const signinSchema = require('./utilities/signinValidate')
const loginSchema = require('./utilities/loginValidate')
const errorMsg = require('./utilities/errorMsg');
const bcrypt = require('bcrypt')
const database = process.env.DBURL || 'mongodb://localhost:27017/wobot';
const secret = process.env.SECRET || 'b1nTQIF8qt';

mongoose.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('connected to database server!!')
    })
    .catch(err => {
        console.log('error in connected !!!')
        console.log(err);
    })

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cookieParser(secret));
app.use(flash())

app.use(session({//here session is created and made available in every route
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}))

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

const isAuth = (req, res, next) => {//for user authorization
    if (req.session.isAuth) {
        next()
    } else {
        req.flash('error', "Please Login")
        res.redirect('/login')
    }
}

function wrapAsync(fn) {//function to catch and process async error
    return function (req, res, next) {
        fn(req, res, next).catch(err => next(err))
    }
}

const validateSignup = (req, res, next) => {// function used to validate signin data
    const { error } = signinSchema.validate(req.body);
    if (error) {
        const mes = error.details.map(el => el.message).join(',')

        if (process.env.NODE_ENV !== "production") {
            throw new errorMsg(mes, 400)
        } else {
            req.flash('error', mes)
            res.redirect('/signup')
        }
    }
    else {
        next()
    }
}

const validateLogin = (req, res, next) => {// function used to validate login data
    const { error } = loginSchema.validate(req.body);
    if (error) {
        const mes = error.details.map(el => el.message).join(',')

        if (process.env.NODE_ENV !== "production") {
            throw new errorMsg(mes, 400)
        } else {
            req.flash('error', mes)
            res.redirect('/login')
        }
    }
    else {
        next()
    }
}

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.get('/signup', (req, res) => {//for signup
    res.render('signup.ejs')
})
app.post('/signup', validateSignup, wrapAsync(async (req, res) => {//redirected to login page after registering
    if (req.body == null) {
        req.flash('error', "Please Provide right credentials")
        res.redirect('/signup')
    }
    const { fname, lname, username, password } = req.body
    const anyUser = await User.findOne({ userName: username })
    if (anyUser === null) {
        const hashedPwd = await bcrypt.hash(password, 12)
        const newUser = await new User({ firstName: fname, lastName: lname, userName: username, password: hashedPwd })
        newUser.save();
        req.flash('success', "User registered Please Login")
        return res.redirect('/login')
    }
    else {
        req.flash('error', "Username Exists")
        return res.redirect('/signup')
    }

}))

app.get('/login', (req, res) => {//for login page
    res.render('login.ejs')
})

app.post('/login', validateLogin, wrapAsync(async (req, res, next) => {//login details are processed
    const { username, password } = req.body
    const user = await User.findOne({ userName: username })
    if (user) {
        const isUser = await bcrypt.compare(password, user.password);
        if (isUser == true) {
            res.cookie('username', username, { expires: new Date(Date.now() + 90000), signed: true })
            req.session.isAuth = true;
            return res.render('userPage.ejs')
        }
        req.flash('error', 'Worng Credentials')
        return res.redirect('/login')
    }
    req.flash('error', 'User Doesnt Exists')
    return res.redirect('/login')
}))

app.get('/fetchUsers', isAuth, wrapAsync(async (req, res) => {//to fetch all users present
    const userN = req.signedCookies.username;
    const user = await User.findOne({ userName: userN })
    if (userN == user.userName) {
        const users = await User.find({})
        res.render('allusers.ejs', { users })
    }

}))

app.get('/fetchUsersDetails', isAuth, wrapAsync(async (req, res) => {//fetches users details
    const userN = req.signedCookies.username;
    const userDetails = await User.findOne({ userName: userN })
    res.render('userDetails.ejs', { userDetails })
}))

app.post('/uploadProducts', isAuth, wrapAsync(async (req, res) => {//to update products from csv file
    const data = req.body.csvFile
    const jsondata = await csvtojson().fromFile(data)
    const userN = req.signedCookies.username;
    const user = await User.findOne({ userName: userN })
    for (let i of jsondata) {
        const newProducts = await Products.insertMany(
            [{ productName: i.name, description: i.description, quantity: i.quantity, price: i.price, user: user._id }])
        newProducts.save;
    }
    req.flash('success', "Products uploaded Successfully")
    return res.redirect('/productList')
}))

app.get('/productList', isAuth, wrapAsync(async (req, res) => {//to get all products of a user
    const userN = req.signedCookies.username;
    const user = await User.findOne({ userName: userN })
    const products = await Products.find({ user: user._id })
    res.render('allproducts.ejs', { products, user })
}))

app.post('/logout', isAuth, (req, res) => { //to logout
    req.session.isAuth = false;
    res.redirect('/login')
})

app.get('*', (req, res) => {//executes if route is not found
    res.status(404)
    res.render('error.ejs')
})

app.listen(PORT, () => {
    console.log(`Port started at ${PORT}`)
})