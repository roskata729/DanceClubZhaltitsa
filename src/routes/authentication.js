const express = require('express');
const router = express.Router();
const pool = require('../database');

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('auth/signup');
});

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile');
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

router.get('/check-username/:username', async (req, res) => {
    try {
      const data = await pool.query('SELECT id FROM users WHERE username = ?', [req.params.username]);
  
      if (data.length) {
        res.status(400).send('Username already exists');
      } else {
        res.status(200).send('Username available');
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Error checking username availability');
    }
  });

module.exports = router;