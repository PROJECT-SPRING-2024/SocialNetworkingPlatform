// vercelBlob.js
const { BlobClient } = require('@vercel/blob');
const path = require('path');

// Vercel Blob client
const blobClient = new BlobClient();

const uploadToVercelBlob = async (file) => {
  const { buffer, originalname } = file;
  const blobName = Date.now() + path.extname(originalname);
  const result = await blobClient.uploadBuffer(buffer, { name: blobName });
  return result.url;
};

module.exports = { uploadToVercelBlob };
