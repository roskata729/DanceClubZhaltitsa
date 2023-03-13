const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/', isLoggedIn, async (req, res) => {
    const allEvents = await pool.query('SELECT *, DATE_FORMAT(Date, "%Y-%m-%d %H:%i:%s") as formattedDate FROM events');
    const isAdmin = req.user.is_admin;
    const events = allEvents.filter(event => {
      return event.AgeLimit <= req.user.user_age;
    }).map(event => {
      const isRegistered = event.participants && event.participants.includes(req.user.id);
      return { ...event, isRegistered };
    });
    res.render('events/list', { events, isAdmin });
  });


router.get('/add', isLoggedIn, (req, res) => {
    res.render('events/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { Title, Date, AgeLimit,  Description } = req.body;
    const newEvent = {
        User_id: req.user.id,
        Title,
        Date,
        AgeLimit,
        Description
    };
    await pool.query('INSERT INTO events SET ?', [newEvent]);
    req.flash('success', 'Събитието беше добавено успешно');
    res.redirect('/events');
});

router.get('/edit/:ID', isLoggedIn, async(req, res) => {
    const { ID } = req.params;
    const event = await pool.query('SELECT * FROM events WHERE ID = ?', [ID]);
    if (event && event.length > 0) {
        event[0].Date = event[0].Date.toISOString().slice(0,10);
        res.render('events/edit', {event: event[0]});
    } else {
        req.flash('message', 'Нещо се обърка при зареждането на събитието.')
        res.redirect('/events');
    }
});

router.post('/edit/:ID', isLoggedIn, async(req, res) => {
    const { ID } = req.params;
    const { Title, Date, AgeLimit,  Description } = req.body;
    const editedEvent = {
        Title,
        Date,
        AgeLimit,
        Description
    };
    await pool.query('UPDATE events SET ? WHERE ID = ?', [editedEvent, ID]);
    req.flash('success', 'Събитието беше обновено успешно');
    res.redirect('/events');
});

router.post('/registerToEvent/:ID', isLoggedIn, async(req, res) => {
    const { ID } = req.params;
    const user_id = req.user.id;
    const event = await pool.query('SELECT * FROM events WHERE ID = ?', [ID]);

    if (event.length === 0) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events');
    }

    const participants = event[0].participants ? JSON.parse(event[0].participants) : [];
    const alreadyRegistered = participants.some((participant) => participant.user_id === user_id);

    if (alreadyRegistered) {
      req.flash('message', 'Вече сте регистриран за това събитие');
      return res.redirect(`/events`);
    }

    const usernameQuery = await pool.query('SELECT username FROM users WHERE id = ?', [user_id]);
    const username = usernameQuery[0].username;

    participants.push({ user_id: user_id, username: username });
    const updatedParticipants = JSON.stringify(participants);

    await pool.query('UPDATE events SET participants = ? WHERE ID = ?', [updatedParticipants, ID]);

    req.flash('success', 'Успешно регистрация!');
    res.redirect(`/events`);
  });
  
  

module.exports = router;