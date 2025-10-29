import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import serverBuild from './dist/server/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

// Path to client assets
const clientDir = join(__dirname, 'dist', 'client');

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
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    
    // Serve static assets from dist/client
    if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/favicon.ico') || 
        url.pathname.match(/\.(png|jpg|jpeg|svg|ico|json|txt)$/)) {
      const filePath = join(clientDir, url.pathname);
      
      if (existsSync(filePath)) {
        const fileContent = readFileSync(filePath);
        const ext = extname(filePath);
        
        // Set appropriate content type
        const contentTypes = {
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.json': 'application/json',
          '.txt': 'text/plain',
        };
        
        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.statusCode = 200;
        res.end(fileContent);
        return;
      }
    }
    
    // Read request body (only for non-GET requests or if needed)
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = chunks.length > 0 ? Buffer.concat(chunks) : null;
    }
    
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
