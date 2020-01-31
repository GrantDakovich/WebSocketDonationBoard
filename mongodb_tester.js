const mongodb = require('mongodb');
const mongoose = require('mongoose');
const MongoClient = mongodb.MongoClient;
const bodyParser = require('body-parser');

const event_model = mongoose.model('event_table', {
	// | recipe_id | name | description | user_id | ingredient | amount | step_number | instruction |
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
		}/*,
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

/*MongoClient.connect("mongodb://localhost:27017/", function(err,db) {
	if (err) throw err;
	var dbo = db.db("charity_org_website");
	var insert = { title: }
})*/

mongoose.connect('mongodb://127.0.0.1:27017/charity_org_website');

var db = mongoose.connection;

const new_event = new event_model(
	{
		"title": "Carbon Capture Machine",
		"description": "This Machine is designed to take carbon out of the air",
		"totalDonations": 700,
		"targetDonations": 600000,
		"related_org": "Exxon Mobile"

	}
);

new_event.save().then(() => {
	console.log(new_event);
	console.log("Save Successful");
}).catch((error) => {
	console.log("Error!", error);
});















