const express = require('express');
const { Blog } = require('../models/BlogModel');
const router = express.Router();
const { authenticateJWT } = require('../middleware/AuthMiddleware');
const { User } = require('../models/UserModel');
const multer  = require('multer')
const crypto = require('crypto');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require('dotenv').config();
const bucketName = process.env.BUCKET_NAME;
const bucketRegion= process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
})

// This creates a random image name so that image files do not get over written in S3
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

// Find All blogs in the DB
router.get("/all", authenticateJWT, async (request, response) => {
    // Check if authentication was successful
    if (request.user && request.user.message === "Authentication successful") {
        // Empty object in .find() means get ALL documents
        const results = await Blog.find({}).populate('user');

        for (const result of results) {
            const getObjectParams = {
                Bucket: bucketName,
                Key: result.imagedata
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, {expiresIn: 3600})
            result.imageUrl = url
        }

        response.json({
            Blog: results
        });
    } else {
        response.status(403).json({ message: "Forbidden: Authentication failed" });
    }
});

// Find one blog by its ID
router.get("/:id", authenticateJWT, async (request, response) => {
    try {
      const blogId = request.params.id;
  
      const result = await Blog.findById(blogId).populate('user');
  
      if (!result) {
        return response.status(404).json({ error: 'Blog not found' });
      }
  
      response.json({
        Blog: result
      });
    } catch (error) {
      console.error("Error fetching blog by ID:", error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Find all blogs by username
router.get("/multiple/username", authenticateJWT, async (request, response) => {
    try {
        const blogUsername = request.query.q;
        const user_id = await User.find({username: blogUsername})
        const result = await Blog.find({ user: user_id }).populate('user');

        if (!result || result.length === 0) {
            return response.status(404).json({ error: 'Blogs not found' });
        }
        console.log("Query result:", result);
        response.json({
            data: result
        });
    } catch (error) {
        console.error("Error fetching blogs by username:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


// Find blog by its location 
router.get("/multiple/location", authenticateJWT, async (request, response) => {
    try {
        const locationToFilterBy = request.query.locationToFilterBy;

        // Use a regular expression to perform a case-insensitive search on multiple fields
        const result = await Blog.find({
            $or: [
                { locationname: { $regex: `^${locationToFilterBy}$`, $options: 'i' } },
                { locationaddress: { $regex: `^${locationToFilterBy}$`, $options: 'i' } },
                { locationcity: { $regex: `^${locationToFilterBy}$`, $options: 'i' } },
                { locationcountry: { $regex: `^${locationToFilterBy}$`, $options: 'i' } },
            ],
        });

        console.log("Query result:", result);

        if (result.length > 0) {
            response.json({
                data: result,
            });
        } else {
            console.log("No blogs exist with the location specified " + locationToFilterBy);
            response.status(404).json({ error: `No blogs found with the location: ${locationToFilterBy}` });
        }

    } catch (error) {
        console.error("Error fetching blogs:", error);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new blog in the DB
// POST localhost:3000/blog/
router.post("/image", authenticateJWT, upload.single('image'), async (request, response) => {
	try{
        
        console.log(request.user)
        const user = await User.findOne({ _id: request.user.userId });

        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        console.log("request.body", request.body)
        console.log("request.file", request.file)

        const imageName = randomImageName();
        const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: request.file.buffer,
            ContentType: request.file.mimetype,
        }

        const command = new PutObjectCommand(params)
        await s3.send(command)

        // Create a new blog entry in the database
        const result = await Blog.create({
            title: request.body.title,
            locationname: request.body.locationname,
            locationaddress: request.body.locationaddress,
            locationcity: request.body.locationcity,
            locationcountry: request.body.locationcountry,
            body: request.body.body,
            tags: request.body.tags,
            imagedata: imageName, // Store the image name in the database
            user: user, 
        });

	    response.json({
	    	Blog: result
	    });
    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({ error: "Internal Server Error" });
    }
});


// Update an existing blog in the DB.
// Find one blog by its ID, and modify that blog. 
// Patch is for whatever properties are provided,
// does not overwrite or remove any unmentioned properties of the cat 
router.patch("/:id", authenticateJWT, async (request, response) => {
	try {
        const blogId = request.params.id;
        console.log(blogId)
    
        const result = await Blog.findById({ _id: blogId }).populate('user');
        console.log(result)
    
        if (!result) {
          return response.status(404).json({ error: 'Blog not found' });
        }
    
        response.json({
          Blog: result
        });
      } catch (error) {
        console.error("Error fetching blog by ID:", error);
        response.status(500).json({ error: 'Internal Server Error' });
      }
});

// Find one blog by its ID,
// and delete it from the DB.
router.delete("/:id", async (request, response) => {
	let result = null;

	response.json({
		Blog: result
	});

});


module.exports = router;