const schedule = require('node-schedule');
const moment = require('moment');
const {checkForNewEntry} = require('./check');
const utils = require('../utils/utils');

const cronList = {};

function getCronList(userID) {
  if (!cronList[userID]) return {};
  return cronList[userID];
}

function getNextTimeIntervalFromNow(timestamp, interval = 30) {
  let firstIntervalTime = moment(Number(timestamp));
  let now = moment();

  let diff = now.diff(firstIntervalTime);

  let diffInMinutes = moment.duration(diff).asMinutes();

  let numberOfIntervals = Math.ceil(diffInMinutes / interval); // Ceil to get the next interval.
  let nextStartTime = firstIntervalTime.clone().add(interval * numberOfIntervals, 'minutes');

  return Number(nextStartTime.format('x'));
}

// Name should be the itemID
async function createCron({itemID, userID, startTime, CronTime, itemName, itemType, equipLocation} = {}) {
  if (CronTime > 59) CronTime = 59;
  let rule = `*/${CronTime} * * * *`; // TODO: transform to cron time, in case user inputs min > 59.
  startTime = Number(startTime);
  let cronID = `${userID}${itemID}`;
  destroyCron(cronID);

  console.log(`Adding cronjob [${cronID}]`);
  console.log(`[${moment().format('lll')}] <@${userID.slice(-4)}> #${itemID} scheduled from \
[${moment(startTime).add(CronTime).format('LTS')}] every ${CronTime}min`);

  let job = schedule.scheduleJob(
    cronID,
    {start: new Date(startTime), rule: rule},
    async function() {
      const bot = require('../discord/discord');
      console.log(`[${moment().format('lll')}] Started <@${userID.slice(-4)}> watch on [#${itemID}:${itemName}] every ${CronTime}min`);
      let newEntries = await checkForNewEntry(userID, itemID);
      console.log(`[${moment().format('lll')}] Ended <@${userID.slice(-4)}> watch on [#${itemID}:${itemName}] every ${CronTime}min`);
      if (!newEntries || newEntries.length < 1) {
        // bot.sendMsg(
        //   utils.defaults.BOT_CHANNEL_ID,
        //   `<@${userID}>\`\`\`Automatic Message: Scrapping [${itemID}:${itemName}] ended with no new listing. Cron every ${CronTime}.\`\`\``
        // );
        return;
      }

      let str = `<@${userID}>\nNEW LISTING:\`\`\`${itemID}:${itemName}\
        \n${utils.printArrAsTable(newEntries, itemType, equipLocation)}[@ws ${itemID}] Cron every ${CronTime}.\`\`\``;
      bot.sendMsg(utils.defaults.BOT_CHANNEL_ID, str);
    }
  );

  if (!cronList[userID]) cronList[userID] = {};
  cronList[userID][cronID] = job;
  return job;
}

function destroyCron(cronID) {
  console.log(`Destroying cronjob [USER:${cronID.slice(-8,-4)} - #${cronID.slice(-4)}]`);
  let job = schedule.scheduledJobs[cronID];
  if (!job) return;
  return job.cancel();
}

async function runInitialCronJob() {
  let wl = await utils.openJSONFile('../wl.json').catch((e) => {
    console.log('Watch list not found. No Cron jobs to schedule on init.');
    return;
  });

  if (!wl) return;
  let userIDs = Object.keys(wl);
  if (userIDs.length < 1) {
    console.log('Watch list is empty. No Cron jobs to schedule on init.');
    return; // No Cron.
  }

  for (userID of userIDs) {
    if (wl[userID].count < 1) continue;
    for (itemID in wl[userID].tracking) {
      let itemObj = wl[userID].tracking[itemID];
      // Calculate next start time for CRON
      let startTime = getNextTimeIntervalFromNow(itemObj.timestamp, itemObj.time);

      // let substractTime = moment.duration(`00:${itemObj.time}:00`);
      // let previousIntervalStartTime = moment(startTime).subtract(substractTime).format('x');

      // Schedule CRON.
      let job = createCron({
        itemID,
        userID,
        startTime: startTime,
        CronTime: itemObj.time,
        itemName: itemObj.itemName,
        itemType: itemObj.itemType,
        equipLocation: itemObj.equipLocation,
      });
    }
  }
}

module.exports = {getNextTimeIntervalFromNow, createCron, destroyCron, runInitialCronJob, getCronList};
