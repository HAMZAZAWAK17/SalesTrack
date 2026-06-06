const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

// 1. GET /api/users/managers - Anyone authenticated can view managers list (for selectors)
router.get('/managers', authMiddleware, userController.getManagersList);

// 2. GET /api/users - Only ADMIN can view users list
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), userController.getUsers);

// 3. GET /api/users/:id - Only ADMIN can view specific user details
router.get('/:id', authMiddleware, roleMiddleware(['ADMIN']), userController.getUser);

// 4. POST /api/users - Only ADMIN can create users
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), userController.create);

// 5. PUT /api/users/:id - Only ADMIN can edit users
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), userController.update);

// 6. DELETE /api/users/:id - Only ADMIN can delete users
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), userController.deleteUser);

module.exports = router;
