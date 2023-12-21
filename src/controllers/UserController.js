// Import required modules
const express = require('express');
const { User } = require('../models/UserModel');
const router = express.Router();
const bcrypt = require("bcrypt");
const { authenticateJWT } = require('../middleware/AuthMiddleware');

// Define routes for user controller
// GET /users - Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /users/:id - Get a user by ID
router.get('/users/:userid', async (req, res) => {
    try {
        const username = await User.findById(req.params.userid
        );
        if (!username) {
            return res.status(404).json({ error: 'User not found' });
      }
        res.json(username);
        }catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
        }
  });

// POST /users - Create a new user
router.post('/createuser', async (req, res) => {
    try {
        const { username, password, firstName, lastName, email, regionsOfInterest, countriesOfInterest,  isAdmin} = req.body;

        // Validate request body
        if (!username || !email || !password || !firstName || !lastName || !regionsOfInterest || !countriesOfInterest) {
            return res.status(400).json({ error: 'Please provide username and email' });
        }

        const user = new User({ username, password, firstName, lastName, email, regionsOfInterest, countriesOfInterest, isAdmin });
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        user.password = hashedPassword;

        // Save the user to the database
        await user.save();

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PATCH /users/update - Update a user
router.patch('/update', authenticateJWT, async (req, res) => {
    try {
      // get user Id from the decoded jwt object
      console.log(req.user.userId)

      // get user Id from the decoded jwt object and convert to string
      const userId = req.user.userId.toString()

      console.log(userId)
      // Find the user from userId
      const user = await User.findOne({ _id: userId })
      console.log(user)

      // Update the user properties
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.regionsOfInterest = req.body.regionsOfInterest || user.regionsOfInterest;
      user.countriesOfInterest = req.body.countriesOfInterest || user.countriesOfInterest;

      // Check if a new password is provided
      if (req.body.password) {
        // Hash and salt the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Update the user's password with the hashed password
        user.password = hashedPassword;
      }

      // Save the updated user
      await user.save();
  
      res.json({
        user: user
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error' });
    }
  });

// DELETE /users/:id - Delete a user by ID
router.delete('/users/:userid', async (req, res) => {
    try {
      const username = await User.findByIdAndDelete(req.params.userid);
      if (!username) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error' });
    }
  });

// Export the router
module.exports = router;