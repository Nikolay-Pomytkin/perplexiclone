import { createServer } from 'node:http';
import serverBuild from './dist/server/server.js';

const port = process.env.PORT || 3000;

// Convert Node.js request to Web API Request
function nodeRequestToWebRequest(req, body) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost';
  const url = `${protocol}://${host}${req.url}`;
  
  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: body ? body : undefined,
  });
}

// Convert Web API Response to Node.js response
async function webResponseToNodeResponse(webResponse, res) {
  res.statusCode = webResponse.status;
  res.statusMessage = webResponse.statusText;
  
  // Copy headers
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  
  // Stream the body
  if (webResponse.body) {
    const reader = webResponse.body.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } catch (error) {
        res.destroy(error);
      }
    };
    pump();
  } else {
    res.end();
  }
}

const server = createServer(async (req, res) => {
  try {
    // Read request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks) : null;
    
    // Convert to Web API Request
    const webRequest = nodeRequestToWebRequest(req, body);
    
    // Call TanStack Start server
    const webResponse = await serverBuild.fetch(webRequest);
    
    // Convert back to Node.js response
    await webResponseToNodeResponse(webResponse, res);
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

