require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const { User } = require("./models/UserModel");
const { Blog } = require("./models/BlogModel");
const { databaseConnect } = require('./database');

mongoose.connect("mongodb+srv://patAdmin:Password1@travellingdiarydb.ogaozxp.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

databaseConnect().then(async () => {

    console.log("Creating seed data!");

    // const Blog = mongoose.model('Blog', {
    // blogid: Number,
	// 	title: String,
    // location: String,
	// 	body: String, 
	// 	tags: String,
	// 	favouritePlacesToChill: [String],
	// 	photos: [String] // URL to some file storage like AWS S3, Google Cloud, Azure, whatever 
	// }};

	// Create User first
    await seedUser();

    // Retrieve the newly created user
    const newUser = await User.findOne({ email: "admin@example.com" });


    let newBlog = new Blog({
        // blogid: 1,
		// date: "01/01/2023",
        title: "Welcome to Japan",
        locationname: "Shinjuku",
		locationaddress: "1 Nihon St",
		locationcity: "Tokyo",
		locationcountry: "Japan",
		body: "This blog post is about Japan", 
		// favouritePlacesToChill: ["Shinjuku", "Shibuya"],
		imagedata: "https://travellingdiarybucket.s3.ap-southeast-2.amazonaws.com/japanimage.jpg",
		user: newUser,
		like: 1
    })

    await newBlog.save().then(() => {
		console.log(`${newBlog.title} is in the DB`);
	});

}).then(async () => {
	//imaginary dbDisconnect() 
	// await dbDisconnect();
})

const seedUser = async () => {
    let client;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: "admin@example.com" });
        if (existingUser) {
            console.log("User already exists");
            return;
        }

        // Create a new user
        const newUser = new User({
            email: "admin@example.com",
            password: "password1",
            username: "admin",
            firstName: "John",
            lastName: "Doe",
            regionsOfInterest: "Tokyo",
            countriesOfInterest: "Japan",
            isAdmin: "true",
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newUser.password, salt);

        newUser.password = hashedPassword;

        // Save the user to the database
        await newUser.save();

        console.log("User created successfully");
    } catch (error) {
        console.error(error);
    } finally {
        // Disconnect from the database after all operations are completed
        if (client) {
            client.close();
        }
    }
};
  
  seedUser();
		
		
		
		
		