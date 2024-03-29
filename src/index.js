const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const mysqlstore = require('express-mysql-session');
const passport = require('passport');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')();
handlebars.registerHelper(helpers);

const { database } = require('./keys');

/* Initializations */
const app = express();
require('./lib/passport');

/* Settings */
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));

app.set('view engine', '.hbs');

/* Middlewars */
app.use(session({
    secret: 'diplomna_session',
    resave: false,
    saveUninitialized: false,
    store: new mysqlstore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

/* Global Variables */
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.hooray = req.flash('hooray');
    app.locals.user = req.user;
    app.locals.multiSportDiscount = 10;
    app.locals.membershipCost = 50;
    next();
});

/* Routes */
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));
app.use('/events', require('./routes/events'));
app.use('/payments', require('./routes/payments'));

/* Public */
app.use(express.static(path.join(__dirname, 'public')));

/* Starting the server */
app.listen(app.get('port'), () => {
    console.log('Server on port: ' + app.get('port'));
});

/* Express Helpers */
handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });
handlebars.registerHelper('times', function(n, block) {
  let accum = '';
  for(let i = 0; i < n; ++i) {
    accum += block.fn(i);
  }
  return accum;
});

handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

