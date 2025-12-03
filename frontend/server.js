import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath, {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true
}));

// Handle API proxy (if needed)
// Uncomment if you want to proxy API requests to your backend
// const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
// app.use('/api', (req, res, next) => {
//   // Proxy logic here
//   next();
// });

// SPA fallback: serve index.html for all routes that don't match static files
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  
  if (!existsSync(indexPath)) {
    console.error(`index.html not found at ${indexPath}`);
    return res.status(500).send(`
      <html>
        <body>
          <h1>Application Error</h1>
          <p>The application has not been built. Please run 'npm run build' first.</p>
        </body>
      </html>
    `);
  }

  try {
    const indexHtml = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(indexHtml);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Server Error</h1>
          <p>Failed to load the application.</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ SPA fallback enabled - all routes will serve index.html`);
  console.log(`🔗 Visit: http://localhost:${PORT}`);
});

