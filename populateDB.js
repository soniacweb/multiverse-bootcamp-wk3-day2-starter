const { sequelize } = require('./db');
const { Restaurant, Menu, Item } = require('./models');
const fsp = require('fs').promises;
const path = require('path');

//sequelize creating the table 
function resetDB() {
    return sequelize.sync({ force: true });
}

//parsing json file
async function loadRestaurants() {
    const filePath = path.join(__dirname, 'restaurants.json');
    const buffer = await fsp.readFile(filePath);
    return JSON.parse(String(buffer));
}

//creating instances from classes and associating fields
async function populateDB() { 
    await resetDB();
    const restaurants = await loadRestaurants();
    restaurants.forEach(async (restaurantData) => {
        const restaurant = await Restaurant.create({
            name: restaurantData.name,
            image: restaurantData.image,
            summary: restaurantData.summary,

        });
        restaurantData.menus.forEach(async (menuData) => {
            const menu = await Menu.create({
                title: menuData.title,
            });
            await restaurant.addMenu(menu);
            menuData.items.forEach(async (itemData) => {
                const item = await Item.create({
                    name: itemData.name,
                    price: itemData.price,
                });
                await menu.addItem(item);
            });
        });
    });
}

module.exports = populateDB;