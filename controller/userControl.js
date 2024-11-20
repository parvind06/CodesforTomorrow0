const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const helper = require('../middleware/errorHandler')
const { users: Users } = require('../models')

// Active user sessions
const activeSessions = {}

module.exports = {
  signup: async (req, res) => {
    const { name, email, password } = req.body
    try {
      const newUser = await Users.create({ name, email, password })
      const token = jwt.sign(
        { id: newUser.id, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      )
      let userdata = {
        accessToken: token,
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
      return helper.created(res, 'User registered successfully', userdata)
    } catch (error) {
      console.log(error)
      res.status(400).json({ message: 'Error creating user', error })
    }
  },

  login: async (req, res) => {
    const io = global.socketio; 
    const { email, password } = req.body;
  
    try {
      const user = await Users.findOne({ where: { email } });
      if (!user) return helper.notFound(res, 'User not found');
  
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return helper.permission(res, 'Invalid credentials');
  
      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1d',
      });
  
      // Handle single session enforcement
      if (activeSessions[email]) {
        const previousSocketId = activeSessions[email];
        
        // Notify the previous session to log out
        io.to(previousSocketId).emit('forceLogout', { message: 'You have been logged out due to a new login.' });
      }
  
      // Store new session with current Socket ID
      const currentSocket = io.sockets.sockets.get(req.socketId); // Assuming `req.socketId` is available
      if (currentSocket) {
        activeSessions[email] = currentSocket.id;
      }
  
      // Set token in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
  
      let userdata = {
        accessToken: token,
        id: user.id,
        name: user.name,
        email: user.email,
      };
  
      return helper.success(res, 'Login successful', userdata);
    } catch (error) {
      console.error(error);
      return helper.error(res, error);
    }
  },

  logout: async (req, res) => {
    const token = req.cookies.token
    if (!token) return helper.error(res, { message: 'No token provided' })

    try {
      const payload = jwt.verify(token, JWT_SECRET)
      delete activeSessions[payload.email] // Remove user session
      res.clearCookie('token')
      return helper.success(res, 'Logged out successfully')
    } catch (error) {
      console.error(error)
      return helper.error(res, { message: 'Invalid token' })
    }
  },
  getMyDetails: async (req, res) => {
    try {
      const userId = req.user.id
      const user = await Users.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'profile', 'createdAt', 'updatedAt']
      })

      if (!user) return helper.notFound(res, 'User not found')
      return helper.success(res, 'User details retrieved', user)
    } catch (error) {
      console.error(error)
      return helper.error(res, error)
    }
  }
}
