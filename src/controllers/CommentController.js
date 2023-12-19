const express = require('express');
const { Comment } = require('../models/CommentModel');
const router = express.Router();
const { User } = require('../models/UserModel');

// Find All commwnts in the DB
router.get("/all", async (request, response) => {
	// Empty object in .find() means get ALL documents
	let result = await Comment.find({});

	response.json({
		Comment: result
	});

});

// Find one Comment by its id
router.get("/:id", async (request, response) => {
	try {
		const commentId = request.params.id;
	
		const result = await Comment.findById(commentId).populate('user');
	
		if (!result) {
		  return response.status(404).json({ error: 'Comment not found' });
		}

		response.json({
			Comment: result
		  });
		} catch (error) {
		  console.error("Error fetching comment by ID:", error);
		  response.status(500).json({ error: 'Internal Server Error' });
		}
	  });


// Find Comment by its date 
router.get("/multiple/username", async (request, response) => {
	try {
        const commentUsername = request.query.username;

        const result = await Comment.find({ commentUsername }).populate('user');

        if (!result || result.length === 0) {
            return response.status(404).json({ error: 'Comments not found' });
        }
        console.log("Query result:", result);
        response.json({
            data: result
        });
	} catch (error) {
        console.error("Error fetching comments by username:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


// Create a new Comment in the DB
// POST localhost:3000/comment/
router.post('/createcomment', async (req, res) => {
	try {
        const { commentId, date, commentbody, userId, blogId } = req.body;

        // Validate request body
        if (!userId || !blogId || !commentId || !date || !commentbody) {
            return res.status(400).json({ error: 'Comment already posted' });
    }

	const comment = new Comment({ commentId, date, commentbody, userId, blogId });
        await comment.save();

    res.json(comment);
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Update an existing comment in the DB.
// Find one comment by its ID, and modify that comment. 
// Patch is for whatever properties are provided,
// does not overwrite or remove any unmentioned properties of the cat 
router.patch("/:commentid", async (request, response) => {
	let result = null;

	response.json({
		Comment: result
	});

});

// Find one comment by its ID,
// and delete it from the DB.
router.delete('/comment/:commentId', async (req, res) => {
	try {
		const commentId = await Comment.findByIdAndDelete(req.params.commentId);
		if (!commentId) {
		  return res.status(404).json({ error: 'Comment not found' });
		}

		res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error' });
    }
  });




module.exports = router;