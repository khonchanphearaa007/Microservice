const express = require('express')
const mongoose = require('mongoose')
const amqp = require('amqplib');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express()
const port = 3004;

// Middlewares
app.use(bodyParser.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
    .then(() => console.log("Connect to MongoDB (products)"))
    .catch((err) => console.error(err.message))

// Product Schema
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
    createdAt: {
        type: Date,
        default: () =>{
            const now = new Date();
            return new Date(now.getTime() + 7 * 60 * 60 * 1000);
        }
        
    }
});

const Product = mongoose.model('Product', ProductSchema);

let channel, connection;

// RabbitMQ retry connection
async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
    while(retries){
        try {
            connection = await amqp.connect('amqp://rabbitmq')
            channel = await connection.createChannel();
            await channel.assertQueue("product_created")
            console.log("Connect to RabbitMQ");
            return;
        } catch (error) {
            console.error("RabbitMQ error:", error.message);
            retries--;
            console.log(`Retries left: ${retries}`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

// Create product
app.post('/products', async(req, res) =>{
    try {
        const product = new Product(req.body);
        await product.save();
        if(!channel){
            return res.status(503).json({
                err: "RabbitMQ not connected"
            })
        }
        channel.sendToQueue(
            "product_created",
            Buffer.from(JSON.stringify({
                productId: product._id,
                name: product.name,
                price: product.price
            }))
        )
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({
            err: error.message
        });
    }
})

// Get all products
app.get('/products', async(req, res) =>{
    const product = await Product.find();
    res.json(product);
})

// 
app.listen(port, () =>{
    console.log(`Product service running on port ${port}`);
    connectRabbitMQWithRetry();
})