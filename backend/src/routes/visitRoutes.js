const express = require('express');
const visitController = require('../controllers/visitController');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All visit routes require JWT token verification
router.use(authMiddleware);

router.get('/', visitController.getVisits);
router.get('/:id', visitController.getVisit);
router.post('/', visitController.create);
router.put('/:id', visitController.update);
router.delete('/:id', visitController.deleteVisit);

module.exports = router;
