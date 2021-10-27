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

    let fetching = true;
    // fetch the KDA price
    while (fetching) {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/kadena/history?date=${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`)
      if (response.data) {
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
        fetching = false;
      } else {
        console.log('Invalid response, trying again in 5 seconds');
      }
      
      // Coingecko API has a rate limit of "10-50 calls per minute", so this should
      // avoid rate-limiting.
      await sleep(5000);
    }
  }
}

run();