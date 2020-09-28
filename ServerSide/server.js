const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const paginate = require('express-paginate');
const timeout = require('connect-timeout');
const path = require('path');

connectDB();
app.use(cors());
app.use(paginate.middleware(1, 50));

app.use(express.static(path.join(__dirname,'client/build')));

app.get('/', (req, res) => res.send('API running'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Define routes
app.use('/api/users', require('./routes/api/Users'));
app.use('/api/auth', require('./routes/api/Auth'));
app.use('/api/asset', require('./routes/api/Asset'));
// app.use(haltOnTimedout);

const port = process.env.PORT || 5000;


app.listen(port, () => console.log('server starting'));
