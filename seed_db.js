const { default: axios } = require('axios');
const db = require('./db');

const KDAperDay = process.env.KDA_PER_DAY;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function run() {
  for (let index = 1; index <= 365; index++) {

    const now = new Date();
    now.setUTCHours(0);
    now.setUTCMinutes(0);
    now.setUTCSeconds(0);
    now.setUTCMilliseconds(0);
    now.setDate(now.getDate()-index);
    const timestamp = now.getTime();

    // fetch the KDA price
    axios.get(`https://api.coingecko.com/api/v3/coins/kadena/history?date=${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`)
      .then((response) => {
        console.log(response.data.market_data.current_price.usd);
        const revenueKDA = response.data.market_data.current_price.usd * KDAperDay;
        db.storeRevenue({
          timestamp: timestamp,
          revenue: revenueKDA,
          data: {
            kda: {
              amount: KDAperDay,
              price: response.data.market_data.current_price.usd,
            },
          },
        });
      }).catch((error) => {
        console.log(error);
      });
    
    // Coingecko API has a rate limit of "10-50 calls per minute", so this should
    // avoid rate-limiting.
    await sleep(5000);
  }
}

run();