const amqp = require('amqplib');

let channel;

async function connectRabbitMQWithRetry(retries = 10, delay = 3000) {
    while (retries > 0) {
        try {
            const connection = await amqp.connect('amqp://rabbitmq');
            channel = await connection.createChannel();

            // TASK EVENTS
            await channel.assertQueue('task_created');
            channel.consume('task_created', (msg) => {
                if (!msg) return;
                const taskData = JSON.parse(msg.content.toString());
                console.log('📌 NEW TASK:', taskData.title);
                channel.ack(msg);
            });

            // PRODUCT EVENTS
            await channel.assertQueue('product_created');
            channel.consume('product_created', (msg) => {
                if (!msg) return;
                const product = JSON.parse(msg.content.toString());
                console.log('📦 NEW PRODUCT:', product.name);
                channel.ack(msg);
            });
            
            // PAYMENT EVENTS
            await channel.assertQueue('payment_created');
            channel.consume('payment_created', (msg) => {
                if (!msg) return;
                const payment = JSON.parse(msg.content.toString());
                console.log("Notification: Payment Event");
                console.log(`Order ID: ${payment.orderId}, Status: ${payment.status}, Amount: ${payment.amount}`);
                channel.ack(msg);
            });

            // PAYEMNT EVENTS FOR UPDATED Status
            await channel.assertQueue("payment_updated");
            channel.consume("payment_updated", (msg) => {
            if (!msg) return;
            const payment = JSON.parse(msg.content.toString());
            console.log("Notification: Payment Event Updated");
            console.log(`Order ID: ${payment.orderId}, Status: ${payment.status}, Amount: ${payment.amount}`);
            channel.ack(msg);
            });


            console.log('Notification service is listening to task & product events');
            return;

        } catch (error) {
            console.error('RabbitMQ connection error:', error.message);
            retries--;
            console.log(`Retrying... (${retries} left)`);
            await new Promise(res => setTimeout(res, delay));
        }
    }

    console.error('Could not connect to RabbitMQ');
}

connectRabbitMQWithRetry();
