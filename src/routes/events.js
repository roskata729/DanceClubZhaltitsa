const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/', isLoggedIn, async(req, res) => {
    res.render('events/list', { hellomessage: 'Hello' });
});

router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { Title, Url, Description } = req.body;
    const newLink = {
        User_id: req.user.id,
        Title,
        Url,
        Description
    };
    await pool.query('INSERT INTO events SET ?', [newLink]);
    req.flash('success', 'Event saved successfully');
    res.redirect('/events');
});

module.exports = router;