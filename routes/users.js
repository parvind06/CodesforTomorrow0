var express = require('express');
var router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const userControl = require('../controller/userControl');
/**
 * User Routes
 */
router.post('/user-list', userControl.signup);

module.exports = router;
