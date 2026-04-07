const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.mp4', '.mov', '.webm', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error('File type not allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 200 * 1024 * 1024 } });
exports.uploadFiles = upload.fields([
  { name: 'pdf',   maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);