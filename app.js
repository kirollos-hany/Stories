const express = require('express');
const dotenv = require('dotenv');
const connectDb = require('./config/db');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const storiesRouter = require('./routes/stories');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const methodOverride = require('method-override');


dotenv.config({ path: './config/config.env' });
const port = process.env.PORT || 5000;

connectDb();

require('./config/passport')(passport);


const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const {formatDate, truncate, stripTags, editIcon, select} = require('./helpers/hbs');

app.engine('.hbs', exphbs.engine({ helpers: {formatDate, truncate, stripTags, editIcon, select}, defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(session({
    secret: 'somesecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, dbName: 'story_books' })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/auth', authRouter);
app.use('/stories', storiesRouter);

app.listen(port, console.log(`Server is running in ${process.env.NODE_ENV} on port: ${port}`));
