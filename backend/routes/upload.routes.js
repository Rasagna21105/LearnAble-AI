const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { uploadFiles } = require('../middleware/upload.middleware');
router.post('/', auth, uploadFiles, (req, res) => {
  const files = {};
  if (req.files.pdf)   files.pdfUrl   = `/uploads/${req.files.pdf[0].filename}`;
  if (req.files.video) files.videoUrl = `/uploads/${req.files.video[0].filename}`;
  res.json(files);
});
module.exports = router;