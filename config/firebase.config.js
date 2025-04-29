const admin = require("firebase-admin");

// Decode Base64 Service Account JSON
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_BASE64 is missing in environment variables"
  );
}

// Convert Base64 back to JSON
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.project_id,
});

module.exports = admin;

