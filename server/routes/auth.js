import express from 'express';
import config from '../config.js';
import { generateAccessToken } from '../helpers/generateAccessToken.js';

const { cypherQuerySession, mySqlDriver, REACT_FRONT_END_URL } = config;

const router = express.Router();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Query the user by email from user_account and user_role

    const [rows] = await mySqlDriver.execute(
      `
      SELECT *
      FROM users 
   
      WHERE email = ?
      `,
      [email]
    );

    console.log({ email, password, rows });

    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // Compare the password with the hash
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user);

    console.log({ accessToken });

    // Send response with token
    res.json({
      success: true,
      token: accessToken,
      data: {
        userId: user.user_id,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', async (req, res) => {
  // Assuming the client stores the token in local storage or cookies
  // You can respond with a message instructing the client to delete the token
  const loggedInUser = req.user;

  console.log({ loggedInUser });

  // await auditTrailMiddleware({
  //   employeeId: loggedInUser.EmployeeID,
  //   action: 'Logout'
  // });

  res.json({
    success: true,
    message:
      'Logged out successfully. Please remove your access token from storage.'
  });
});

router.post('/forgetPassword', async (req, res, next) => {
  try {
    const email = req.body.email;

    // Find user by email
    const [user] = await mySqlDriver.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log({ user });

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email is not registered in our system.'
      });
    }

    // Generate a unique JWT token for the user
    const token = jwt.sign({ email: user[0].email }, 'secret', {
      expiresIn: '10m'
    });

    // Send the token to the user's email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Reset Password',
      html: `<h1>Reset Your Password</h1>
        <p>Click on the following link to reset your password:</p>
        <a href="${REACT_FRONT_END_URL}/reset-password/${token}">${REACT_FRONT_END_URL}/reset-password/${token}</a>
        <p>The link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>`
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: 'Email sent' });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const newPassword = req.body.newPassword;
    const decodedToken = jwt.verify(req.params.token, 'secret');

    if (!decodedToken) {
      return res.status(401).send({ message: 'Invalid token' });
    }

    // Find user by email from the decoded token
    const [user] = await mySqlDriver.execute(
      'SELECT * FROM users WHERE email = ?',
      [decodedToken.email]
    );

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email is not registered in our system.'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password in the database
    await mySqlDriver.execute('UPDATE users SET password = ? WHERE email = ?', [
      hashedPassword,
      decodedToken.email
    ]);

    res.status(200).send({ message: 'Password updated' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

export default router;
