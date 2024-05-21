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
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  price: faker.commerce.price(),
}));

// Simulate a database call with OpenTelemetry tracing
const mockDatabaseCall = (productId) => {
  const tracer = opentelemetry.trace.getTracer('');
  return tracer.startActiveSpan('SELECT', (span) => {
    span.setAttributes({
      'db.system': 'mysql',
      'db.name': 'ecommerce',
      'db.operation': 'SELECT',
      'db.statement': `SELECT * FROM products WHERE id=?`,
      'db.instance.id': 'mysql-e26b99z.ecomm.com',
      'db.user': 'readonly_user'
    });

    return new Promise((resolve, reject) => {
      // Simulate a delay for the database call
      setTimeout(() => {
        const product = products.find(p => p.id === productId);
        if (product) {
          span.end(); // End the span on success
          resolve(product);
        } else {
          span.setStatus({ code: 2, message: 'Product not found' }); // Set span status to error
          span.end(); // End the span on error
          reject(new Error('Database error: Product not found'));
        }
      }, 15);
    });
  });
};

// Routes
app.get('/products', (req, res) => {
  logger.info('Products viewed');
  res.json(products);
});

app.post('/cart/add/:id', async (req, res) => {
  const activeSpan = opentelemetry.trace.getActiveSpan();
  try {
    const product = await mockDatabaseCall(req.params.id);
    activeSpan.setAttributes({
      'app.product.id': req.params.id,
      'app.product.name': product.name,
    });
    logger.info(`Product added to cart: ${product.name}`);
    res.send(`Product added to cart: ${product.name}`);
  } catch (error) {
    logger.error(`Error adding product to cart: ${error.message}`);
    res.status(500).send('Internal Server Error');
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

// Traffic generation function
let bugIntroduced = false;

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
        // Conditionally introduce a realistic bug
        if (bugIntroduced) {
          // Introduce a bug by causing the mock database call to fail intermittently
          await axios.post(`http://localhost:${port}/cart/add/${faker.string.uuid()}`);
        } else {
          // Normal traffic
          const product = products[Math.floor(Math.random() * products.length)];
          await axios.post(`http://localhost:${port}/cart/add/${product.id}`);
        }
        break;
    }
  } catch (error) {
    logger.error(`Traffic generation error: ${error.message}`);
  }
};

// Function to send a marker to Honeycomb
const sendHoneycombMarker = async (message) => {
  if (!process.env.HONEYCOMB_API_KEY) {
    logger.info('Honeycomb API key not found, skipping marker')
    return;
  }
  const timestamp = Math.floor(Date.now() / 1000);
  await axios.post(`https://api.honeycomb.io/1/markers/${process.env.OTEL_SERVICE_NAME}`, {
    start_time: timestamp,
    message: message,
    type: 'deploy'
  }, {
    headers: {
      'X-Honeycomb-Team': process.env.HONEYCOMB_API_KEY
    }
  });
};


// Schedule traffic generation and bug introduction
const trafficInterval = setInterval(generateTraffic, 100); // Generate traffic every 1 / 10 seconds
const MINUTES = 60000;
// Introduce a bug after 7 minutes
setTimeout(() => {
  bugIntroduced = true;
  sendHoneycombMarker('Add in new products to the store')
  //logger.info('Bug introduced: increased error rate expected');
}, 7 * MINUTES);

// Resolve the bug after another 5 minutes
setTimeout(() => {
  bugIntroduced = false;
  sendHoneycombMarker('(Rollback) Add in new products to the store')
 //logger.info('Bug resolved: traffic returning to normal');
}, 10 * MINUTES);

// Stop traffic generation after 11 minutes
setTimeout(() => {
  clearInterval(trafficInterval);
  logger.info('Traffic generation stopped');
  process.exit(0);
}, 11 * MINUTES);