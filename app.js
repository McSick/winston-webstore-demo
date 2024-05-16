const express = require('express');
const winston = require('winston');
const morgan = require('morgan');
const { faker } = require('@faker-js/faker');
const axios = require('axios');
const opentelemetry = require('@opentelemetry/api');
// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'combined.log' }),
    // new winston.transports.File({ filename: 'errors.log', level: 'error' })
  ]
});

// Create Express app
const app = express();

// Use Morgan to log HTTP requests
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Mock product database
const products = Array.from({ length: 10 }, () => ({
  id: faker.datatype.uuid(),
  name: faker.commerce.productName(),
  price: faker.commerce.price(),
}));

// Routes
app.get('/products', (req, res) => {
  logger.info('Products viewed');
  res.json(products);
});

app.post('/cart/add/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  const activeSpan = opentelemetry.trace.getActiveSpan();
  activeSpan.setAttributes({
    'app.product.id': req.params.id,
    'app.product.name': product?.name,
  });

  if (product) {
    logger.info(`Product added to cart: ${product.name}`);
    res.send(`Product added to cart: ${product.name}`);
  } else {
    logger.warn(`Product not found: ${req.params.id}`);
    res.status(404).send('Product not found');
  }
});

app.post('/order', (req, res) => {
  const orderId = faker.datatype.uuid();
  const activeSpan = opentelemetry.trace.getActiveSpan();
  activeSpan.setAttributes({
    'app.order.id': orderId,
  });
  logger.info(`Order placed: ${orderId}`);
  res.send(`Order placed: ${orderId}`);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

// Generate traffic to create logs
const generateTraffic = async () => {
  try {
    const randomAction = Math.floor(Math.random() * 4);
    switch (randomAction) {
      case 0:
        await axios.get(`http://localhost:${port}/products`);
        break;
      case 1:
        const product = products[Math.floor(Math.random() * products.length)];
        await axios.post(`http://localhost:${port}/cart/add/${product.id}`);
        break;
      case 2:
        await axios.post(`http://localhost:${port}/order`);
        break;
      case 3:
        // Generate a bad request intentionally
        await axios.post(`http://localhost:${port}/cart/add/invalid-id`);
        break;
    }
  } catch (error) {
    logger.error(`Traffic generation error: ${error.message}`);
  }
};

setInterval(generateTraffic, 10); // Generate traffic every second
