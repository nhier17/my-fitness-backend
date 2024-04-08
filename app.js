require('dotenv').config();
require('express-async-errors');

//express
const express = require('express');
const app = express();

//mock route

app.get('/', (req, res) => {
    res.send('Eat, Train, Sleep!');
});




const port = process.env.PORT || 5000
const start = (req,res) => {
    try {
       app.listen(port, () => console.log(`server is listening on port ${port}...`)); 
    } catch (error) {
        console.log(error);
    }
}
start();