const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('../lib/helpers');

const {Logging} = require('@google-cloud/logging');

const logging = new Logging();
const log = logging.log('my-log');

const metadata = {
  resource: {
    type: 'global',
  },
};

// Write a critical log entry
log.write('This is a critical message!', {severity: 'CRITICAL', metadata});

// Write a warning log entry
log.write('This is a warning message!', {severity: 'WARNING', metadata});

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
        const user = rows[0];
        const ValidPassword = await helpers.matchPassword(password, user.password);
        if (ValidPassword) {
            done(null, user, req.flash('success', 'Добре дошли  ' + user.username));
        } else {
            done(null, false, req.flash('message', 'Грешна парола'));
        }
    } else {
        return done(null, false, req.flash('message', 'Името не съществува'));
    }

}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const { fullname, birth_date } = req.body;
    const newUser = {
        username,
        password,
        fullname,
        birth_date,
    }
    newUser.password = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO users SET ?', [newUser]);
    newUser.id = result.insertId;
    return done(null, newUser);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
});