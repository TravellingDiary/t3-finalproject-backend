const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	commentId: {
		type: Number,
		required: true,
		unique: true
    },
	date: {
		type: Date,
		required: true,
		unique: false
	},
    commentbody: {
		type: String,
		required: true,
		unique: false
	},
	userId: {
		type: String,
		required: true,
		unique: false,
        isforeignkey: true
	},
	blogId: {
		type: Number,
		required: true,
		unique: false,
        isforeignkey: true
	},
	
	
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
	Comment
}