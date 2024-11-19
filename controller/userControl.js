const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { users: Users } = require('../models')

module.exports = {
  signup: async (req, res) => {
    const { name, email, password } = req.body

    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await Users.create({ name, email, password: hashedPassword })

      res.status(201).json({ message: 'User created successfully', user })
    } catch (error) {
      res.status(400).json({ message: 'Error creating user', error })
    }
  }
}
