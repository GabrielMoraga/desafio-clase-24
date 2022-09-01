const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')

//Configuro dotenv para ambiente de desarrollo
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/* ------------------------------------------------*/
/*           Persistencia por MongoDB              */
/* ------------------------------------------------*/
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
const url = process.env.MONGO_ATLAS_URL

/* ------------------------------------------------*/
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(session({
    store: MongoStore.create({
        mongoUrl: url,
        mongoOptions: advancedOptions
    }),
    /* ----------------------------------------------------- */

    secret: 'holamundo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 40000
    }
}))

/* ------------------------------------------------*/
/*               Motor de Vistas                   */
/* ------------------------------------------------*/
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')


// AUTH Middleware
function webAuth(req, res, next) {
    console.log(req.session?.nombre)
    if (req.session?.nombre) {
        next()
    } else {
        res.redirect('/login')
    }
}

/* ------------------------------------------------*/
/*                   Endpoints                     */
/* ------------------------------------------------*/

app.get('/home', webAuth , (req,res) => {
    res.render('home', {nombre: req.session.nombre})
})

app.get('/login', (req,res) => {
    if (req.session?.nombre) {
        res.redirect('home')
    } else {
        res.render("login");
    }
})

app.post('/login', (req,res) => {
    const {nombre} = req.body;
    req.session.nombre = nombre;
    if(req.session.nombre) {
        res.render("home", {nombre: req.session.nombre})
    } else {
        res.send({nombre: -1})
    }

})

app.get('/logout', (req,res) => {
    const nombre = req.session?.nombre
    console.log(nombre)
    if (nombre) {
        req.session.destroy(err => {
            if (!err) {
                res.render("logout", {nombre})
            } else {
                res.redirect('/home')
            }
        })
    } else {
        res.redirect('/home')
    }
})

const PORT = 8080
app.listen(PORT, () => {
    console.log(`Servidor express escuchando en el puerto ${PORT}`)
})

