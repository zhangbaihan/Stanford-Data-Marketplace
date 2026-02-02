const multer = require('multer');
const path = require('path'); 

// This is memory storage: fine for CSVs under 50MB. Large files need other approaches.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Defining allowed file types for our data marketplace
    const allowedMimeTypes = [
        'text/csv',                                           
        'application/vnd.ms-excel',                          
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        'application/json',                                 
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.json'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);
    const isExtensionAllowed = allowedExtensions.includes(fileExtension);
    if (isMimeTypeAllowed || isExtensionAllowed) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      // Maximum file size in bytes
      // 50 * 1024 * 1024 = 50 MB
      // 1024 bytes = 1 KB
      // 1024 KB = 1 MB
      fileSize: 50 * 1024 * 1024,
    },
  });

module.exports = upload;