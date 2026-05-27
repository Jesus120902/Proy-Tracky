const fs = require('fs');
const path = require('path');

/**
 * Saves a base64 encoded image to either AWS S3 (if configured) or the local filesystem.
 * @param {string} base64String - The base64 data string (e.g. data:image/png;base64,iVBORw...)
 * @param {string} prefix - Filename prefix (e.g. 'signature', 'photo')
 * @returns {Promise<string>} The URL or relative path to access the file
 */
const uploadBase64Image = async (base64String, prefix = 'evidence') => {
  if (!base64String) return null;

  // Extract content and extension
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    // If it's already an URL, return it
    if (base64String.startsWith('http') || base64String.startsWith('/uploads')) {
      return base64String;
    }
    throw new Error('Formato base64 inválido o vacío');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Determine file extension
  let extension = 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
    extension = 'jpg';
  } else if (mimeType.includes('gif')) {
    extension = 'gif';
  }

  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

  // AWS S3 Mode Check
  if (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  ) {
    try {
      // Attempt to dynamically load AWS SDK
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const s3 = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      const bucketName = process.env.AWS_S3_BUCKET;
      const key = `uploads/${filename}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
      );

      // Return public S3 URL
      return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (err) {
      console.warn('⚠️ Error de subida a S3, recurriendo a almacenamiento local:', err.message);
    }
  }

  // Local Storage Fallback Mode
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);

  // Return local static path
  const host = process.env.API_URL || 'http://localhost:5000';
  return `${host}/uploads/${filename}`;
};

module.exports = { uploadBase64Image };
