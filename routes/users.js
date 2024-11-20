var express = require('express');
var router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const userControl = require('../controller/userControl');
const { validateSignup,validateLogin} = require('../validator/validation')
/**
 * User Routes
 */
router.post('/sign-up',validateSignup, userControl.signup);
router.post('/login',validateLogin, userControl.login);
router.get('/logout', userControl.logout);
router.get('/me',requireAuth, userControl.getMyDetails);



module.exports = router;
