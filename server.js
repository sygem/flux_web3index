const express = require('express');
const cors = require('cors');
//const router = require('./router.js');
const path = require('path');
const dotenv = require('dotenv');
const { default: axios } = require('axios');
const db = require('./db');
const apiRoutes = require('./api');

const app = express();

dotenv.config();

// Add  cors middleware
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin 
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));

// Add middleware for parsing JSON and urlencoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const router = express.Router();
apiRoutes.addRoutes(router);

app.use('/api/v1', router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    //console.log(req)
    const err = new Error('Not Found');
    err.status = 404;
    res.send('Route not found');
    next(err);
});

const server = app.listen(process.env.PORT || 8000).on('listening', () => {
    console.log(`App live and listening on port: ${(process.env.PORT || 8000)}`);
});


// Every 10 minutes, update the revenue figure for the current date

const calculateRevenue = () => {
  const KDAperWeek = 2300;
  const now = new Date();
  now.setUTCHours(0);
  now.setUTCMinutes(0);
  now.setUTCSeconds(0);
  now.setUTCMilliseconds(0);
  const timestamp = now.getTime();

  // how far through this day are we?
  const dayProgress = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  const numKDAToday = KDAperWeek / 7 * dayProgress;

  // fetch the KDA price
  axios.get('https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=usd')
    .then((response) => {
      if (response.data.kadena && response.data.kadena.usd) {
        const revenueKDA = response.data.kadena.usd * numKDAToday;
        db.storeRevenue({
          timestamp: timestamp,
          revenue: revenueKDA,
          data: {
            kda: {
              amount: numKDAToday,
              price: response.data.kadena.usd,
            },
          },
        });
      }
    });
}

setInterval(() => {
  calculateRevenue();
}, 1000 * 60 * 10);
calculateRevenue();

