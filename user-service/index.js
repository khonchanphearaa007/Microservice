const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
const port = 3001

app.use(bodyParser.json())

// mongoose.connect('mongodb://localhost:27017/users')
// .then(() => console.log("Connected to MongoDB"))
// .catch(error => console.error("MongoDB connection error: ", error.message));

mongoose.connect('mongodb://mongo:27017/users')
.then(() => console.log("Connected to MongoDB"))
.catch(error => console.error("MongoDB connection error: ", error.message));

const UserSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User', UserSchema);

// create a new user
app.post('/users', async(req, res) =>{
    const {name, email} = req.body;
    try {
        const user = new User({name,email});
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error("Error saving: ",error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

// get all users
app.get('/users', async(req, res) =>{
    const users = await User.find();
    res.json(users);
})

app.get('/', (req, res) => {
  res.send('Hello World Khon chanphearaa!')

})
app.listen(port, () => {
  console.log(`User service listening on port ${port}`)
})
