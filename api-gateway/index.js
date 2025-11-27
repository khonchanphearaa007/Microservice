const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());                     // <-- REQUIRED
app.use(express.urlencoded({ extended: true }));

// USER SERVICE ROUTE
app.use('/users', createProxyMiddleware({
    target: 'http://user-service:3001',      // <-- MUST MATCH SERVICE NAME + PORT
    changeOrigin: true
}));

// TASK SERVICE ROUTE   
app.use('/tasks', createProxyMiddleware({
    target: 'http://task-service:3002',
    changeOrigin: true
}));

app.listen(3000, () => {
    console.log('API Gateway running on port 3000');
});



