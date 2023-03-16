const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn, isAdministrator } = require('../lib/auth');

router.get('/add', isAdministrator, (req, res) => {
    res.render('links/add');
});

router.post('/add', isAdministrator, async (req, res) => {
    const { Title, Url, Description } = req.body;
    const newLink = {
        User_id: req.user.id,
        Title,
        Url,
        Description
    };
    await pool.query('INSERT INTO links SET ?', [newLink]);
    req.flash('success', 'Видеото беше добавено успешно');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {
    const links = await pool.query('SELECT *, DATE_FORMAT(Created_At, "%Y-%m-%d %H:%i:%s") as formattedDate FROM links');
    const isAdmin = req.user.is_admin;
    res.render('links/list', { links, isAdmin });
  });

router.get('/view/:ID', isLoggedIn, async (req, res) => {
const { ID } = req.params;
const link = await pool.query('SELECT *, DATE_FORMAT(Created_At, "%Y-%m-%d %H:%i:%s") as formattedDate FROM links WHERE ID = ?', [ID]);
res.render('links/view', { link: link[0], isAdmin: req.user.is_admin });
});

router.get('/delete/:ID', isAdministrator, async(req, res) => {
    const { ID } = req.params;
    await pool.query('DELETE FROM links WHERE ID = ?', [ID]);
    req.flash('success', 'Видеото беше премахнат успешно');
    res.redirect('/links');
});

router.get('/edit/:ID', isAdministrator, async(req, res) => {
    const { ID } = req.params;
    const link = await pool.query('SELECT * FROM links WHERE ID = ?', [ID]);
    res.render('links/edit', {link: link[0]});
});

router.post('/edit/:ID', isAdministrator, async(req, res) => {
    const { ID } = req.params;
    const { Title, Description, Url } = req.body;
    const editedLink = {
        Title,
        Description,
        Url
    };
    await pool.query('UPDATE links SET ? WHERE ID = ?', [editedLink, ID]);
    req.flash('success', 'Видеото беше обновено успешно');
    res.redirect('/links');
});

module.exports = router;