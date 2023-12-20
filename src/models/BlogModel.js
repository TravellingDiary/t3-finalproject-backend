const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
	date: {
		type: Date,
		required: false,
		unique: false,
		default: new Date(Date.now())
	},
    title: {
		type: String,
		required: true,
		unique: false
	},
    locationname: {
		type: String,
		required: true,
		unique: false
	},
	locationaddress: {
		type: String,
		required: true,
		unique: false
	},
	locationcity: {
		type: String,
		required: true,
		unique: false
	},
	locationcountry: {
		type: String,
		required: true,
		unique: false
	},
	body: {
		type: String,
		required: true,
		unique: false
	},
	imagedata: {
		type: String,
		required: true,
		unique: false
	},
	imageUrl: {
		type: String,
		required: false,
		unique: false
	},
	user: {
		type: mongoose.Types.ObjectId,
		ref: 'User'
	},
	like: {
		type: Number,
		required: false,
		unique: false
	}
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = {
	Blog
}