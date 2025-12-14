const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// MIDDLEWARES
app.use(cors());

// app.use(express.json());                    
// app.use(express.urlencoded({ extended: true }));

// USER SERVICE ROUTE
app.use('/users', createProxyMiddleware({
    target: 'http://user-service:3001',      
    changeOrigin: true
}));

// TASK SERVICE ROUTE   
app.use('/tasks', createProxyMiddleware({
    target: 'http://task-service:3002',
    changeOrigin: true
}));

// PRODCUT SERIVCE ROUTE
app.use('/products', createProxyMiddleware({
    target: 'http://product-service:3004',
    changeOrigin: true,
    timeout: 5000,
    proxyTimeout: 5000,
    onError(err, req, res){
        console.error("Error here:", err.message);
        res.status(503).json({message: 'Product service unvaliable'});
    }
}))
app.listen(3000, () => {
    console.log('API Gateway running on port 3000');
});



