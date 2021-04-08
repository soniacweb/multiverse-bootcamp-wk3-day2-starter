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


// app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});

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
