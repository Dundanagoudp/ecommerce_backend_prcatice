const http = require('http');
const app = require('./app');
const admin = require('./config/firebase.config'); // Import admin first
const port = process.env.PORT || 4000;

const server = http.createServer(app);

// Test Firebase connection
const bucket = admin.storage().bucket();
bucket.getFiles()
  .then((files) => {
    console.log('✅ Firebase Storage connected successfully.');
  })
  .catch((err) => {
    console.error('❌ Firebase Storage connection failed:', err);
  });

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});