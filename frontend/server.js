import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = join(__dirname, 'dist');

console.log('🚀 Starting SmartSpend+ Frontend Server...');
console.log(`📁 Static files directory: ${distPath}`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

// Check if dist folder exists
if (!existsSync(distPath)) {
  console.error('❌ ERROR: dist folder not found!');
  console.error('   Please run "npm run build" first');
}

// Check if index.html exists
const indexPath = join(distPath, 'index.html');
if (!existsSync(indexPath)) {
  console.error('❌ ERROR: dist/index.html not found!');
  console.error('   Please run "npm run build" first');
}

// Serve static files from dist directory
// This handles: JS, CSS, images, fonts, etc.
app.use(express.static(distPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
  etag: true,
  index: false, // Don't automatically serve index.html for directories
}));

// SPA Fallback - THIS IS CRITICAL FOR REACT ROUTER
// All routes that don't match static files will serve index.html
// React Router will then handle the routing on the client side
app.get('*', (req, res) => {
  console.log(`📄 Serving index.html for route: ${req.path}`);
  
  if (!existsSync(indexPath)) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Application Error</h1>
          <p>The application has not been built.</p>
          <p>Run: npm run build</p>
        </body>
      </html>
    `);
  }
  
  // Send index.html for ALL routes - React Router handles the rest
  res.sendFile(indexPath);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          SmartSpend+ Frontend Server Started               ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  🌐 URL: http://0.0.0.0:${PORT}                              ║`);
  console.log(`║  📁 Serving: ${distPath.slice(-40).padStart(40)}  ║`);
  console.log('║  ✅ SPA Fallback: ENABLED                                  ║');
  console.log('║  🔄 All routes → index.html → React Router                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
});
