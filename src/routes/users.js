const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "24h"
    // });
    function generateJwt(userId){

      let newJwt = jwt.sign(
        // Payload
            {
                userId, 
            },
        
    
        // Secret key for server-only verification
        process.env.JWT_KEY,
    
        // Options
        {
          expiresIn: "24h"
        }
    
      );
    
      return newJwt;
    }

    let freshJwt = generateJwt(user._id.toString());

    res.json({ jwt: freshJwt });
  } catch (error) {
    console.error("Login error:", error); // Log the error details
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;