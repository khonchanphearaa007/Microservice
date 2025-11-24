const amqp = require('amqplib');

async function start() {
    try {
        connection = await amqp.connect("amqp://rabbitmq_node");
        channel = await connection.createChannel(); 
        // Create a channel So this is going to create a commnunication channel through
        // which we send and receive messages

        await channel.assertQueue("task_created"); // if Queue not exists, created Notification service will 
        // start listening
        console.log("Notification Service is listening to messages...");

        channel.consume("task_created", (msg) =>{
            const taskData = JSON.parse(msg.content.toString()); // Convert the message content from binary to JavaScript object
            console.log("Notification: NEW TASK: ", taskData.title);
            console.log("Notification: NEW TASK: ", taskData);
            channel.ack(msg); // Acknowledge that the message has been processed
        })
    } catch (error) {
        console.error("RabbitMQ connection error: ", error.message);
        
    }
}
start();
