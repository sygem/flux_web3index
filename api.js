const db = require('./db');
const apicache = require('apicache');

const cache = apicache.middleware;

// API Routes
const KDAperDay = 2300 / 7;

module.exports = {
  addRoutes(router) {
    router.get('/revenue', 
      cache('1 hour'),
      async function(req, res) {
        const revenueData = await db.fetchRevenue((data) => {
          const now = new Date();
          now.setUTCHours(0);
          now.setUTCMinutes(0);
          now.setUTCSeconds(0);
          now.setUTCMilliseconds(0);
          const today = now.getTime();
        
          const oneDayAgo = getDateMinus(now, 1);
          const twoDaysAgo = getDateMinus(now, 2);
          const oneWeekAgo = getDateMinus(now, 7);
          const twoWeeksAgo = getDateMinus(now, 14);
          const thirtyDaysAgo = getDateMinus(now, 30);
          const sixtyDaysAgo = getDateMinus(now, 60);
          const ninetyDaysAgo = getDateMinus(now, 90);

          let total = 0;
          let oneDayAgoTotal = 0;
          let twoDaysAgoTotal = 0;
          let oneWeekAgoTotal = 0;
          let twoWeeksAgoTotal = 0;
          let thirtyDaysAgoTotal = 0;
          let sixtyDaysAgoTotal = 0;
          let ninetyDaysAgoTotal = 0;

          const days = [];

          data.forEach((dayData) => {
            // Check if the value from the database is less than the
            // amount of KDA we receive per day
            if (dayData.timestamp !== today && dayData.data.kda.amount < KDAperDay) {
              dayData.revenue = KDAperDay * dayData.data.kda.price;
            }
            if (dayData.timestamp <= ninetyDaysAgo) {
              ninetyDaysAgoTotal += dayData.revenue;
            }
            if (dayData.timestamp <= sixtyDaysAgo) {
              sixtyDaysAgoTotal += dayData.revenue;
            }
            if (dayData.timestamp <= thirtyDaysAgo) {
              thirtyDaysAgoTotal += dayData.revenue;
            }
            if (dayData.timestamp <= twoWeeksAgo) {
              twoWeeksAgoTotal += dayData.revenue;
            }
            if (dayData.timestamp <= oneWeekAgo) {
              oneWeekAgoTotal += dayData.revenue;
            }
            if (dayData.timestamp <= twoDaysAgo) {
              twoDaysAgoTotal += dayData.revenue;
            }
            if (dayData.timestamp <= oneDayAgo) {
              oneDayAgoTotal += dayData.revenue;
            }
            total += dayData.revenue;
            days.push({
              date: dayData.timestamp,
              revenue: dayData.revenue,
            });
          });

          // Sort the days array by timestamp, most recent last
          days.sort((a,b) => a.date - b.date);

          // And return the formatted data
          res.json(
            {
              revenue: {
                now: Math.round(total),
                oneDayAgo: Math.round(oneDayAgoTotal),
                twoDaysAgo: Math.round(twoDaysAgoTotal),
                oneWeekAgo: Math.round(oneWeekAgoTotal),
                twoWeeksAgo: Math.round(twoDaysAgoTotal),
                thirtyDaysAgo: Math.round(thirtyDaysAgoTotal),
                sixtyDaysAgo: Math.round(sixtyDaysAgoTotal),
                ninetyDaysAgo: Math.round(ninetyDaysAgoTotal),
              },
              days,
            })
          });
      })
  },
};

// Take a number of days off a given date
const getDateMinus = (now, days) => {
  const date = new Date(now);
  date.setDate(date.getDate()-days);
  return date.getTime();
};