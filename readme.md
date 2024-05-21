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


## OTel Tracing and logging

Use the below ENV vars to send your traces and logs to Honeycomb. You can sign up for a free account at https://www.honeycomb.io/signup/ to get your API key.

```
export OTEL_EXPORTER_OTLP_ENDPOINT="https://api.honeycomb.io" # US instance
#export OTEL_EXPORTER_OTLP_ENDPOINT="https://api.eu1.honeycomb.io" # EU instance
export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=your-api-key"
export OTEL_SERVICE_NAME="your-service-name"
```

## Honeycomb Marker

If using Honeycomb, you can add a marker to your logs to make it easier to find them in the Honeycomb UI. To do this, add the following ENV var

```
export HONEYCOMB_API_KEY="your-api-key"
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
