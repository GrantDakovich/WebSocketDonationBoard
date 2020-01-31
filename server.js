const express = require("express");
const hbs = require("hbs");
const fs = require("fs");
const http = require("http");
const socketio = require("socket.io");
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const MongoClient = mongodb.MongoClient;
const bodyParser = require('body-parser');
const formData = require('form-data');
const multer = require('multer');
const busboy = require('connect-busboy');
const session = require('express-session');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const event_model = mongoose.model('event_table', {
	// | recipe_id | name | description | user_id | ingredient | amount | step_number | instruction |
		timestamp: {
			type: Number,
			required: true
		},
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		totalDonations: {
			type: Number,
			required: true
		},
		targetDonations: {
			type: Number,
			required: true
		},
		related_org: {
			type: String,
			required: true
		},
		donor_list: {
			type: Array,
			required: true
		},
		trusted_org: {
			type: Boolean,
			required: true
		},
		is_completed: {
			type: Boolean,
			required: true
		}
		/*,
		instructions: {
			type: Array,
			required: true
		},
		ingredient_names: {
			type: Array,
			required: true
		},
		ingredient_amounts: {
			type: Array,
			required: true
		},
		user_id: {
			type: String,
			required: true
		}*/
	},'event_table'
);

var upload = multer({ dest: 'uploads/' });
hbs.registerPartials(__dirname + '/partials');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboy());

app.use(express.static(__dirname));
app.set('view engine','hbs');

app.use(session({
	name: 'sid',
	resave: false,
	saveUninitialized: false,
	secret: 'ssh!quietmi',
	cookie: {
		maxAge: 1000 * 60 * 60 * 2,
		sameSite: true,
		secure: false
	}
}))

const users = [
	{id: 1, username: 'russBoi', password: 'pass'},
	{id: 2, username: 'dankMemes', password: 'pass'}
];

const redirectLogin = (req, res, next) => {
	if (!req.session.userId) {
		res.redirect('/login');
	}
	else{
		next();
	}
}

io.on('connection', (socket) => {
	console.log("New WebSocket connection");
	socket.on('donate',(donationVal) => {
		// Do update of donations.
		io.emit('updateDonationView', allDonationArray);
	});
});

app.get('/', redirectLogin, (req,res) => {
	res.render("index");
});

app.get('/login', (req,res) => {
	res.render("login");
});

app.post('/login', (req,res) => {
	console.log(req.body.username);
	console.log(req.body.password);
	const { username, password } = req.body;
	if (username && password) {
		const user = users.find(
			user => user.username === username && user.password === password
		);
		if (user) {
			req.session.userId = user.username;
			return res.redirect('/');
		}
	}
	res.send();
});

app.get('/createEventCharity', redirectLogin, (req,res) => {
	res.render("createEventCharity");
});

app.get('/donate/:event', redirectLogin, (req,res) => {
	const event_name = req.params.event;
	console.log("event_name: " + event_name);
	console.log(typeof event_name);
	res.render("donationPage", {"event_name": event_name});
});

app.post('/donate', redirectLogin, (req,res) => {
	console.log(req.body.event_name);
	res.redirect('/donate/' + req.body.event_name);
	//res.render("donationPage");
});

app.post('/submitCharityEvent', redirectLogin, (req,res) => {

	mongoose.connect('mongodb://127.0.0.1:27017/charity_org_website');

	var db = mongoose.connection;
	const new_event = new event_model(
		{
			"timestamp": Date.now(),
			"title": req.body.title,
			"description": req.body.description,
			"totalDonations" : 0,
			"targetDonations": parseInt(600000),
			"related_org": req.body.related_org,
			"donor_list": [],
			"trusted_org": false,
			"is_completed": false
		}
	);
	new_event.save().then(() => {
		console.log(new_event);
		console.log("Save Successful");
		res.render('eventSubmissionSuccess');
	}).catch((error) => {
		console.log("Error!", error);
		res.send(error);
	});
});

app.post('/getFeed', redirectLogin, (req,res) => {
	console.log("here");
	mongoose.connect('mongodb://127.0.0.1:27017/charity_org_website');
	event_model.find({}, (err, data) => {
		if (err){
			console.log(err);
		}
		console.log(data);
		res.send(data);
	});

	/*res.send([
		{organization_name: "POW",dollar_amount: "30"},
		{organization_name: "PITA",dollar_amount: "40"}
	]);*/
});

app.get('/recycleType', redirectLogin, (req,res) => {
	res.render("recycleType");
});

app.post('/submitDonation', redirectLogin, (req,res) => {
	const event_name = req.body.event_name;
	const donationAmount = req.body.donationAmount;
	console.log(event_name);
	console.log(donationAmount);
	mongoose.connect('mongodb://127.0.0.1:27017/charity_org_website');
	event_model.findOne({title: event_name}, (err,data) => {
		event_model.updateOne({title: event_name}, { $set: { totalDonations: parseInt(data.totalDonations) + parseInt(donationAmount) }}, (err) => {
			if (err){
				console.log(err);
			}
			console.log(data);
			event_model.findOne({title: event_name}, (err, data) => {
				io.emit('updateDonationView',{"donation_obj":data,"username":req.session.userId,"donationAmount":donationAmount});
				res.redirect("/donationSuccess");
			});
		});
	});
});

app.get("/donationSuccess", redirectLogin, (req,res) => {
	res.render("donationSuccess")
});

app.post('/uploadPlasticPhoto', redirectLogin, (req,res) => {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        fstream = fs.createWriteStream(__dirname + '/uploads/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            //res.redirect('back');
        });
        fs.readFile(__dirname + '/uploads/'+filename, function(err, data) {
        	console.log(data);
	    	const request = new XMLHttpRequest();
	    	request.open("POST","http://10.141.217.189:5000/image-request");
	    	request.setRequestHeader('Content-Type', 'image/jpg');
	    	request.send(data);
	    	request.onreadystatechange = (e) => {

				//console.log(recipesRequest.readyState);
				//console.log(recipesRequest.status);
				if (request.readyState == 4 && request.status == 200) {
					console.log(request.responseText);
					const result = JSON.parse(request.responseText).result;
					console.log(result);
					if (result == "PETE"){
						res.render("PETE");
					}else if(result == "HDPE"){
						res.render("HDPE");
					}
					else if(result == "PVC"){
						res.render("PVC");
					}
					else if(result == "LDPE"){
						res.render("LDPE");
					}
					else if(result == "PP"){
						res.render("PP");
					}
					else if(result == "PS"){
						res.render("PS");
					}
					else if(result == "Other"){
						res.render("Other");
					}
					//res.send(JSON.parse(request.responseText).result);
				}
			}
	    });
    });

    

})

server.listen(3000, (req,res) => {
	console.log("Connected");
});


































