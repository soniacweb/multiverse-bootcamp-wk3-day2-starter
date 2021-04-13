const express = require('express');
const { Restaurant, Menu, Item } = require('./models');
const path = require('path');
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const populateDB = require('./populateDB');

const app = express();
const port = 3000;
populateDB();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// app.use(express.static(path.join(__dirname, 'public')));


// setup our templating engine - handlebar
const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')

// serve static assets from the public/ folder
app.use(express.static('views'));

app.get('/', async (req, res) => {
    const restaurants = await Restaurant.findAll({
        include: [
            {
                model: Menu, as: 'menus',
                include: [{model: Item, as: 'items'}]
            }
        ],
        nest: true
    })
    res.render('home', {restaurants})
})

// new routes for individual restaurant menu page

// app.get('/restaurants/:id', async (req, res) => {
//     console.log("get restaurant with ID:", req.params.id)
//     res.send()
// })

app.get('/restaurants/:id', async (req, res) => {

    const restaurant = await Restaurant.findByPk(req.params.id)
    console.log(req.params.id)
    const menus = await restaurant.getMenus({
        include: [{model: Item, as: 'items'}],
        nest: true
    })
    res.render('restaurant', {restaurant, menus})
})

// new route for /restaurant

app.get('/new', async (req, res) => {
    res.render('new')
})

app.post('/restaurants', async (req, res) => {
    console.log('reqbody', req.body); // this is the JSON body
    // TODO - add code to insert data into the database!
    
    await Restaurant.create(
        req.body
        // name: restaurantData.name,
        // image: restaurantData.image,
        // heroImg: restaurantData.heroImg,
        // summary: restaurantData.summary,
    );

    res.redirect('/')
})

app.get('/restaurants/:id/delete', async (req, res) => {
    Restaurant.findByPk(req.params.id)
        .then(restaurant => {
        restaurant.destroy()
        res.redirect('/')

        })

})

app.get('/restaurants/:id/edit', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
    res.render('edit', {restaurant})
})

app.post('/restaurants/:id/edit', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
    await restaurant.update(req.body)
    res.redirect(`/restaurants/${restaurant.id}`)
})

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});
