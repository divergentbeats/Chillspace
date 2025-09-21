const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    // Extract the path and query string from the incoming request
    const { path, queryStringParameters, httpMethod, body, headers } = event;

    // Construct the Gemini API URL based on the incoming request path and query
    const geminiApiBase = 'https://api.gemini.com'; // Replace with actual Gemini API base URL
    const apiPath = path.replace('/.netlify/functions/gemini-proxy', '');
    const url = new URL(geminiApiBase + apiPath);

    // Append query parameters if any
    if (queryStringParameters) {
      Object.entries(queryStringParameters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Prepare fetch options
    const fetchOptions = {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        // Forward any other headers as needed, e.g. authorization
        ...headers,
      },
    };

    if (httpMethod !== 'GET' && body) {
      fetchOptions.body = body;
    }

    // Make the request to Gemini API
    const response = await fetch(url.toString(), fetchOptions);

    // Get response data
    const data = await response.text();

    // Return the response from Gemini API
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
