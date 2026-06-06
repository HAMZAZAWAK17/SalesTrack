const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const visitController = require('../controllers/visitController');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All visit routes require JWT token verification
router.use(authMiddleware);

// Multer setup - Ensure uploads directory exists at project root
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Format de fichier non supporté. JPEG, JPG, PNG ou WEBP uniquement.'));
  }
});

// Routes
router.get('/', visitController.getVisits);
router.get('/export', visitController.exportVisits); // Must be mapped before GET /:id
router.get('/:id', visitController.getVisit);
router.post('/', visitController.create);
router.put('/:id', visitController.update);
router.delete('/:id', visitController.deleteVisit);
router.post('/upload', upload.single('photo'), visitController.uploadPhoto);
router.post('/cleanup-photos', visitController.cleanupPhotos);

module.exports = router;
