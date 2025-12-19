const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const bodyParser = require('body-parser');
const Schema = mongoose.Schema;
require('dotenv').config(); 

const app = express();
const PORT = 3005; // This port 3005 running docker for payment service

// Middlewares
app.use(bodyParser.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connect to MongoDB (Payment)"))
.catch((error) => console.error(error.message))

// Payment Schema
const PaymentSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    userId: {
      type: String,
      required: true  
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: "pending"
    },
    paymentCard: String,
    createdAt: {
        type: Date,
        default: () => new Date(new Date().getTime()+7*60*60*1000) // For default UTC+7 in Asian
    },
    updatedAt:{type: Date}
});

// Create a Model
const Payment = mongoose.model('Payment', PaymentSchema);

let channel, connection;
const portRabbitMQ = 'amqp://rabbitmq'
async function connectToRabbitMQ(retries = 5, delay= 3000) {
    while(retries){
        try {
            connection = await amqp.connect(portRabbitMQ);
            channel = await connection.createChannel();
            await channel.assertQueue("payment_created");
            console.log("Connect to RabbitMQ");
            return;
        } catch (error) {
            console.error("RabbitMQ error: ", error.message);
            retries--;
            console.log(`Retries left: ${retries}`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}
// Routes
// Create payment service
app.post('/payments', async(req, res) =>{
    try {
        const payment = new Payment(req.body);
        await payment.save();
        if(channel){
            channel.sendToQueue(
                "payment_created",
                Buffer.from(JSON.stringify({
                    paymentId: payment._id,
                    orderId: payment.orderId,
                    userId: payment.userId,
                    amount: payment.amount,
                    status: payment.status
                }))
            )
        }
        res.status(201).json(payment);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

// GET ALL Payment
app.get('/payments', async(req, res) =>{
    const payments = await Payment.find();
    res.json(payments);
});

// Update Payments Status
app.patch('/payments/:id', async(req, res) =>{
    const { status } = req.body;
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            {status, updatedAt: new Date()},
            {new: true}
        );
        if(!payment) return
        res.status(404).json({error: "Payment is not found!"});

        // Send event into notification-service:
        if(channel){
            channel.sendToQueue(
                "payment_updated",
                Buffer.from(JSON.stringify({
                    orderId: payment.orderId,
                    status: payment.status,
                    amount: payment.amount
                }))
            )
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
});

// Start server
app.listen(PORT, () =>{
    console.log(`Payment service running on port ${PORT}`);
    connectToRabbitMQ();
})

