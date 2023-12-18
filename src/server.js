const express = require('express');

// make a server instance 
const app = express();

// CORS required to connect to frontend
const cors = require('cors');
const corsOptions = {
    //            frontend localhost,  frontend deployed
    origin: ["http://localhost:3000", "https://beamish-narwhal-32cb29.netlify.app"],
    optionsSuccessStatus: 200
}



app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (request, response) => {
    response.json({
        message:"Hello world"
    });
});

// Routes
app.use("/users", require("./routes/users"));

const UserRouter = require('./controllers/UserController');
app.use('/users', UserRouter);

const BlogRouter = require('./controllers/BlogController');
app.use('/blog', BlogRouter);

module.exports = {
    app
}