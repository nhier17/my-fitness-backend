require('dotenv').config();
require('express-async-errors');

//express
const express = require('express');
const app = express();

//rest of packages
const cors = require('cors');
const rateLimiter = require('express-rate-limit');
const cookieParser = require('cookie-parser');

//db
const connectDB = require('./db/connect');

//routers
const authRouter = require('./routes/AuthRoutes');
const workoutRouter = require('./routes/WorkoutRoutes');
const exerciseRouter = require('./routes/ExerciseRoutes');

//middleware
const notFoundMiddleware = require('./middleware/not-Found');
const errorHandlerMiddleware = require('./middleware/error-handler');


app.use(cors());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use('/uploads',express.static('uploads'))

app.use('/api/auth', authRouter);
app.use('/api/workout', workoutRouter);
app.use('/api/exercise', exerciseRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
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