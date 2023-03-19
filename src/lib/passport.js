const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
        const localUser = rows[0];
        const ValidPassword = await helpers.matchPassword(password, localUser.password);
        if (ValidPassword) {
            //await helpers.saveTrainingsInDatabase();
            done(null, localUser, req.flash('success', 'Добре дошли  ' + localUser.username));
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
    const user = rows[0];
    user.user_age = await helpers.calculateAge(user.birth_date);
    done(null, user);
});
