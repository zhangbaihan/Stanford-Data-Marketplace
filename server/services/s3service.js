
// If we ever switch from S3 to Google Cloud, we only change this file.

const { 
    PutObjectCommand,    // For uploading files
    GetObjectCommand,    // For downloading files
    DeleteObjectCommand, // For deleting files
  } = require('@aws-sdk/client-s3');
  
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
  const { s3Client, bucketName } = require('../config/s3');
  const { v4: uuidv4 } = require('uuid');
  const path = require('path');

  const uploadFile = async (fileBuffer, originalName, mimeType) => {

    const extension = path.extname(originalName); // '.csv'
    
    // Generate unique ID
    const uniqueId = uuidv4(); // 'a1b2c3d4-e5f6-...'
    
    // Create a structured key (path in S3)
    // Format: datasets/2024/01/unique-id.csv
    // This organizes files by year/month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const key = `datasets/${year}/${month}/${uniqueId}${extension}`;
    
    // AWS SDK v3 uses a "command pattern":
    // 1. Create a command object describing what you want to do
    // 2. Send the command using the client
    // This is different from SDK v2 which used method calls directly.
    
    const command = new PutObjectCommand({
      // Which bucket to upload to
      Bucket: bucketName,
      
      // The "key" is the file's path/name in S3
      // S3 is flat (no real folders), but '/' in keys creates folder-like structure
      Key: key,
      
      // The actual file content (binary data)
      Body: fileBuffer,
      
      // The MIME type - helps browsers know how to handle downloads
      ContentType: mimeType,
      
      // Metadata - extra info stored with the file
      Metadata: {
        'original-name': originalName,
      },
    });
  
    try {
      // send() executes the command and returns a promise
      // If it fails, it throws an error
      await s3Client.send(command);
      
      // Return the key so we can store it in the database
      // The key is all we need to retrieve the file later
      return {
        key: key,
        size: fileBuffer.length, // Size in bytes
      };
    } catch (error) {
      // Log the error for debugging
      console.error('S3 upload error:', error);
      // Re-throw so the calling code knows it failed
      throw new Error('Failed to upload file to storage');
    }
  };
  
  // ============================================================
  // GET SIGNED DOWNLOAD URL
  // ============================================================
  
  /**
   * Generates a temporary URL that allows downloading a file from S3.
   * Our S3 bucket is PRIVATE (not publicly accessible).
   * To let users download, we generate a special URL that:
   * 1. Is valid only for a limited time (e.g., 1 hour)
   * 2. Is cryptographically signed (can't be forged)
   * 3. Gives temporary access to just that one file
   */
  const getDownloadUrl = async (key, expiresIn = 3600) => {

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
  
    try {
      // getSignedUrl creates a pre-signed URL
      // This URL includes authentication in its query parameters
      // Anyone with this URL can download the file (until it expires)
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate download link');
    }
  };
  
  // ============================================================
  // DELETE FILE FROM S3
  // ============================================================
  
  const deleteFile = async (key) => {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
  
    try {
      await s3Client.send(command);
      console.log(`Deleted file from S3: ${key}`);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from storage');
    }
  };
  
  // ============================================================
  // GET FILE CONTENT (download to memory)
  // ============================================================

  /**
   * Downloads a file from S3 and returns its content as a string.
   * Used by the Explore feature so Claude can read dataset contents.
   */
  const getFileContent = async (key) => {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    try {
      const response = await s3Client.send(command);
      // Convert the readable stream to a string
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString('utf-8');
    } catch (error) {
      console.error('Error downloading file content from S3:', error);
      throw new Error('Failed to download file content');
    }
  };

  module.exports = {
    uploadFile,
    getDownloadUrl,
    deleteFile,
    getFileContent,
  };