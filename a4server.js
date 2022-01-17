const fs = require("fs");
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const mongo = require('mongodb');
const pug = require('pug');
const app = express();
const bodyParser = require('body-parser');
const User = require("./models/userModel");
const Order = require("./models/orderModel");

const MongoDBStore = require('connect-mongodb-session')(session); //store server info in dtabase

//session Store
const store = new MongoDBStore({
	mongoUrl: 'mongodb://localhost/a4',
	collection: 'session'
});
store.on('error', (error) => {console.log(error)});

//middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.set("templates");
app.set('view engine', 'pug');
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
	name: 'a4-session',
	secret: "some secret key",
	cookie:{
		maxAge: 1000*60*60*24*7 //<- a week BUT set to 30min
	},
	store: store,
	resave: true,
	saveUninitialized: false
}))

function exposeSession(req, res, next) {
    if (req.session) {
        res.locals.session = req.session;
    }
    next();
}
app.use(exposeSession);

//log requests received
app.use(function(req,res,next){
	console.log(`${req.method} for ${req.url}`);
	next();
});

let restaurants = {};
let id = 3;

let orderSummary = {};

fs.readdir("restaurants",(err, files) =>{

	if(err) return console.log(err);
	for(let i=0; i<files.length;i++){
		if(files[i] != ".DS_Store"){
			let resto = require("./restaurants/" + files[i]);
			restaurants[resto.id] = resto;
		}
	}
});

//GETS
app.route(["/"])
	.get((req, res) => {
		res.status(200);
		res.setHeader("Content-Type","text/html");
		res.send(pug.renderFile("./templates/index.pug", {
			session: req.session
		}));
	});

app.get("/users", (req, res) => {

	console.log("req.session",req.session.username);

	if(req.query.name){
		User.find( {username: {$regex: req.query.name, $options: 'i'}}, function(err, arr) {
			if (err) return handleError(err);

			console.log("user: ", arr);

			res.status(200);
			res.send(pug.renderFile("./templates/users.pug", {
				session: req.session,
				users: arr
			}));
		});
	}else {
		User.find( {}, function(err, arr) {
			if (err) return handleError(err);

			console.log("user: ", arr);

			res.status(200);
			res.send(pug.renderFile("./templates/users.pug", {
				session: req.session,
				users: arr
			}));
		});
	}
});

app.get("/profile", (req, res) => {
	console.log("session: ", req.session)
	res.status(200);

	Order.find({client: req.session.username}, (err, result) => {
			if (err) {
				res.status(404);
			}

			console.log("order: ", result);

			res.status(200);
			res.send(pug.renderFile("./templates/profile.pug", { data: req.session, session: req.session, order: result}));
		});
});

app.get("/users/:userID", (req, res) => {
	// Check if a movie with the specified ID exists
	console.log(req.params)
  const targetId = req.params.userID;
  let oid;

  try {
    oid = new mongo.ObjectID(targetId);
  } catch {
    res.status(404).send("Unknown ID");
    return;
  }

  User.findOne({ _id: oid }, (err, data) => {
    if (err) {
      res.status(404).send(`User with ID ${targetId} does not exist.`);
    }

		if (data.privacy && !(req.session.username == data.username)){
			res.status(404);
			res.send("you are not authorized to view this profile");
			return;
		}

    console.log("data: ",data);
		console.log("session", req.session);

		Order.find({client: req.session.username}, (err, result) => {
			if (err) {
				res.status(404);
			}

			console.log("orders: ", result);

			res.status(200);
			res.send(pug.renderFile("./templates/profile.pug", { data: data, session: req.session, order: result}));
		});
	})
});

app.get("/register", (req, res) => {
		res.status(200);
		res.send(pug.renderFile("./templates/register.pug", {session: req.session }));
});

app.get("/login", (req, res) => {
		res.status(200);
		res.send(pug.renderFile("./templates/login.pug", {
			session: req.session,
		}));
});

app.get("/orderform", (req, res) => {
		res.status(200);
		res.send(pug.renderFile("./templates/orderform.pug", {
			session: req.session,
		}));
});

app.get("/order/:orderID", (req, res) => {

	console.log("Order.client", req.params);

	Order.findOne({_id: req.params.orderID.split(':')[1]}, (err, data) => {
    if (err) {
      res.status(403);
    }

		console.log("data: ", data);
		console.log("session: ", req.session)

		User.findOne({username: data.username}, (err, result) => {
			console.log("result ", result);
			if((result.privacy == false) || (data.username == req.session.username)){
				res.status(200);
				res.send(pug.renderFile("./templates/ordersummary.pug", {
					data: data,
					session: req.session
				}));
			}else{
				res.status(404);
				res.send("you are not authorized to view this order");
			}
		})
	})
});

//POSTS
app.post("/register", (req, res) => {

	// User.deleteMany({}, function (err, result) {
	// 	if (err) return handleError(err);
	// })

	console.log("registering");
	console.log("req.body: ", req.body);

	var username = req.body.username.toLowerCase();
	var password = req.body.password;

	User.find({}, function (err, result) {

		for(let i = 0; i < result.length; i++){
			if(result[i].username == username.toLowerCase()){
				//res.status(400).send("Username not available");

				res.send(pug.renderFile("./templates/register.pug", {
					error: "Username not available",
					session: req.session,
				}))
				return;
			}
		}

		let newUser = new User({
			username: username,
			password: password,
			//loggedin: true,
			privacy: false,
		});

		newUser.save(function (err, result) {
			if (err) return handleError(err);

			req.session.username = username;
			req.session.password = password;
			req.session.loggedin = true;

			console.log("inserted");

			res.status(200);
			res.send(pug.renderFile('./templates/profile.pug', {
				session: req.session,
				data: req.session
			}));
		})
	})
})

app.post("/login", (req, res) => {

	if (req.session.loggedin) {
		res.status(200).send("Already logged in.");
		return;
	}

	const username = req.body.username.toLowerCase();
	const password = req.body.password;

	console.log("req.body", req.body);
	console.log(username);

	User.findOne({username: username, password: password}, function (err, result) {
		if (err) return handleError(err);

		console.log("result: ", result);

		if(result){
			req.session.loggedin = true;
			req.session.privacy = false;

			req.session.username = username;
			res.locals.session = req.session;
			req.session.userid = result._id;

			res.status(200).redirect("/profile");
			res.send();
		}else{
			res.status(401).send("invalid credentials");
		}

		console.log("result: ", result);
	})
})

app.post("/logout", (req, res) => {
	req.session.loggedin = false;
	req.session.destroy();
	delete res.locals.session;
	res.redirect('/');
})

app.post("/radio", (req, res) => {

	console.log("req: ",req.body);

	let username = req.session.username;
	let flag = req.body.status;

	if(flag == 'private'){
		req.session.privacy = true;

		User.findOneAndUpdate({username: username}, {privacy:true}, {new:true}, function(err,result){
			if (err) return handleError(err);

			result.save(function (err, result) {
				if (err) return handleError(err);

				console.log("user: ", result);

				res.status(200);
				res.end()
			})

			console.log("user: ", result);

		})} else if (flag == 'public'){

			req.session.privacy = false;

			User.findOneAndUpdate({username: username}, {privacy:false}, {new:true}, function(err,result){
					if (err) return handleError(err);

					result.save(function (err, result) {
						if (err) return handleError(err);

						console.log("user: ", result);

						res.status(200);
						res.end()
					})

					console.log("user: ", result);
				})
		}
})

app.post("/order", (req, res) => {
		console.log(req);
		// let orderingClient = req.session.username;
		// let orderInfo = req.body;
		// let orderID = sessionID; //(????????????)

		// orderSummary.client = orderingClient;
		// orderSummary.summary = orderInfo;
		// orderSummary.ID = orderID;

		let newOrder = new Order({
			username: req.session.username,
			restaurant: req.body.restaurantName,
			summary: req.body
		})

		newOrder.save(function (err, result) {
			if (err) return handleError(err);

			console.log("inserted");
		})

		res.status(200);
		res.send();
});

//connecting to database
mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to database'));
db.once('open', function(){
	User.init(()=>{
		//startServer();
		app.listen(3000);
	})
});
