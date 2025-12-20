const express = require('express')
const mongoose = require('mongoose')
// const bodyParser = require('body-parser')

// Add dependencies bcryptjs and jsowebtoken
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')


const app = express()
const port = 3001
// Allow requests from Android / browser
app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended: true}))
// app.use(bodyParser.json())

// mongoose.connect('mongodb://localhost:27017/users')
// .then(() => console.log("Connected to MongoDB"))
// .catch(error => console.error("MongoDB connection error: ", error.message));

mongoose.connect('mongodb://mongo:27017/users')
.then(() => console.log("Connected to MongoDB"))
.catch(error => console.error("MongoDB connection error: ", error.message));

const UserSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    password: String
});

const User = mongoose.model('User', UserSchema);

// create a new user 
// Register (Sign up)
app.post('/users/register', async(req, res) =>{
    const {name, email, password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        await user.save();
        res.status(201).json({user, message: "User registered Successfully."});
    } catch (error) {
        console.error("Error saving: ",error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

// get all users
// Login API
app.post('/users/login', async(req, res) => {
    const {email, password} = req.body;
   
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Store Token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            "SECRET_KEY",
            { expiresIn: "7d" }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
   } catch (error) {
        res.status(500).json({ error: error.message });
   }
});


app.get('/', (req, res) => {
  res.send('User service running!')

})
app.listen(port, () => {
  console.log(`User service listening on port ${port}`)
})
