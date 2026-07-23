const logger = require('./logger');

/**
 * Step 2: The Error Catcher Middleware
 * 
 * Express error handling middleware function that catches any unhandled error 
 * or crash across the API endpoints, sends formatted details (HTTP Method, Route, 
 * Status Code, and Stack Trace) to the Logger (logger.js), and returns a clean 
 * JSON response to the client.
 * 
 * @param {Error} err - The error object thrown or passed via next(err).
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} _next - Express next function.
 */
function errorHandler(err, req, res, _next) {
  // Determine HTTP status code (default to 500 Internal Server Error)
  const statusCode = err.status || err.statusCode || 500;
  const errMessage = err.stack || err.message || 'Internal Server Error';
  
  // Format log entry with HTTP request method and original URL
  const formattedLog = `[${req.method} ${req.originalUrl}] Status: ${statusCode} - Error: ${errMessage}`;
  
  // Send formatted error string to the Logger to write to app.log
  logger.log(formattedLog);

  // Return structured JSON response to the user client
  res.status(statusCode).json({
    error: {
      message: err.message || 'Server error',
      status: statusCode
    }
  });
}

module.exports = errorHandler;
