require('dotenv').config();
require('express-async-errors');

//express
const express = require('express');
const app = express();

//db
const connectDB = require('./db/connect');
//mock route

app.get('/', (req, res) => {
    res.send('Eat, Train, Sleep!');
});
//create user schema and controllers



const port = process.env.PORT || 5000;
const start = async (req,res) => {
    try {
        await connectDB(process.env.MONGO_URI);
       app.listen(port, () => console.log(`server is listening on port ${port}...`)); 
    } catch (error) {
        console.log(error);
    }
}
start();