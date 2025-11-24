const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const app = express();
const port = 3002;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/tasks')
    .then(() => console.log("Connnected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error", error.message));

// Define Task schema and model
const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt:{
        type: Date,
        // default: Date.now for this it defualt of date UTC time
        
        // We can install moment-timezone package to set default time to UTC+7
        // npm install moment-timezone
        // default:p () => moment().tz("Asia/Phnom_Penh").toDate()
        default: () =>{
            const now = new Date();
            const localTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // UTC+7
            return localTime;
        }
    }
});
const Task = mongoose.model('Task', TaskSchema);

let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
    while (retries) {
        try {
            connection = await amqp.connect('amqp://rabbitmq_node');
            channel = await connection.createChannel();
            await channel.assertQueue("task_created");
            console.log("Connected to RabbitMQ");
            return;
        } catch (error) {
            console.error("RabbitMQ connection error: ", error.message);
            retries--;
            console.log(`Retries again left: ${retries}`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

app.post('/tasks', async (req, res) =>{
    const {title, description, userId} = req.body;
    try {
        const task = new Task({title, description, userId});
        await task.save();

        const message = {taskId: task._id, userId, title};
        if(!channel){
            return res.status(503).json({
                error: "RabbitMQ not connected"
            });
        }
        channel.sendToQueue("task_created", Buffer.from(JSON.stringify(message)));
        console.log("Task created message sent to RabbitMQ");
        res.status(201).json(task);
    } catch (error) {
        console.error("Error saving: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// get all tasks
app.get('/tasks', async (req, res)=>{
    const tasks = await Task.find();
    res.json(tasks);
})

app.listen(port, () =>{
    console.log(`Tasks service listening on port ${port}`);
    connectRabbitMQWithRetry();
})

