# Winston Webstore Demo

This is a simple Node.js application that simulates a webstore to showcase Winston logging capabilities. The application generates traffic and logs various activities such as viewing products, adding items to the cart, and placing orders, including handling both successful and unsuccessful requests.

## Features

- View products
- Add products to the cart
- Place orders
- Generates logs at different levels (info, warn, error)
- Simulates realistic traffic with a mix of good and bad requests

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

## Getting Started

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/mcsick/winston-webstore-demo.git
   cd winston-webstore-demo
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

### Running the Application

1. Start the server:

   ```sh
   npm run trace
   ```

   The server will start on port 3000.

2. The application will automatically generate traffic and create logs.

### Application Endpoints

- `GET /products`: View the list of products
- `POST /cart/add/:id`: Add a product to the cart (replace `:id` with a valid product ID)
- `POST /order`: Place an order

### Logs

- Logs are written to the console and sent to opentelemetry via the sdk


## Project Structure

```
winston-webstore-demo/
├── app.js         # Main application file
├── package.json   # Project dependencies and scripts
└── README.md      # Project documentation
```

## Dependencies

- [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for Node.js
- [winston](https://www.npmjs.com/package/winston): A logger for just about everything
- [morgan](https://www.npmjs.com/package/morgan): HTTP request logger middleware for Node.js
- [@faker-js/faker](https://www.npmjs.com/package/@faker-js/faker): Generate massive amounts of fake data
- [axios](https://www.npmjs.com/package/axios): Promise based HTTP client for the browser and Node.js

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
