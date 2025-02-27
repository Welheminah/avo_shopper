const express = require('express');
const exphbs  = require('express-handlebars');

const AvoShopper = require("./avo-shopper");
const pg = require("pg");
const Pool = pg.Pool;

const app = express();
const PORT =  process.env.PORT || 3019;

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://wecode:pg123@localhost:5432/avo_shopper';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// add more middleware to allow for templating support

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

let avoShopper = AvoShopper(pool);

app.get('/',async function(req, res) {
	const topFive =await avoShopper.topFiveDeals();
	console.log(topFive)
	const list = await avoShopper.listShops();
	res.render('index', {topFive,
		list
	});
});


app.get('/add',async function(req, res) {
	const listOfShops = await avoShopper.listShops();
	// const shpId = req.params.id;
	// const theId = await avoShopper.dealsForShop(shpId)
	// console.log(theId)
	const price = req.body.price;
	const qty = req.body.qty;

	res.render('add', {listOfShops});
});


app.post('/add', async function(req, res){
	const shpId = req.body.shop_name;
	// console.log(req.body);
	const qty = req.body.qty;
	const price = req.body.price;
	const listOfShops = await avoShopper.listShops();

	
	await avoShopper.createDeal(shpId, qty, price)

	res.redirect("/add")
}) 


app.get('/createshop',async function(req, res) {

	res.render('createshop');
});

app.post('/createshop', async function(req, res) {
	const shopName = req.body.shop_name;

	await avoShopper.createShop(shopName);

	res.redirect('/');
});

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});