const bot = require('./discord');
const {checkForNewEntry} = require('../scheduler/check');
const wl = require('../watchlist/watchlist');
const utils = require('../utils/utils');
const cron = require('../scheduler/scheduler');
let globalVend = require('../globalVendObj');

async function run(msg, input) {
  if (!input) return;
  let listingInfo = input.listingInfo;

  try {
    // Decide to add or remove
    if (input.status === 'add') {
      const addMsg = msg.reply(`<@${listingInfo.userID}>Adding #${listingInfo.itemID} to your list...`);
      const addedObj = await wl.addToWatchList(listingInfo);
      addMsg.delete();
      utils.printReply(msg, addedObj);
      if (addedObj.status === 'notFound') return;
      else if (addedObj.status === 'full') return;
      else if (addedObj.status === 'overwrite' && globalVend[addedObj.by]) {
        globalVend[addedObj.by][addedObj.itemID] = {};
      }
      // new CRON
      let job = cron.createCron({
        itemID: addedObj.itemID,
        userID: addedObj.by,
        startTime: addedObj.timestamp,
        cronTime: addedObj.time,
        itemName: addedObj.itemName,
        itemType: addedObj.itemType,
        equipLocation: addedObj.equipLocation,
      });
      const waitMsg = await msg.reply('Getting Initial Scrap...');
      const scrappedData = await checkForNewEntry(addedObj.by, addedObj.itemID);
      waitMsg.delete();

      if (!scrappedData)
        return bot.sendMsg(
          utils.defaults.NOTIF_CHANNEL_ID,
          `<@${addedObj.by}>\`\`\`Currently there is no shop for [#${addedObj.itemID}: ${addedObj.itemName}]\`\`\``
        );
      if (scrappedData.length < 1)
        return bot.sendMsg(
          utils.defaults.NOTIF_CHANNEL_ID,
          `<@${addedObj.by}>\`\`\`No NEW listing found for [#${addedObj.itemID}: ${addedObj.itemName}] <= ${utils.formatPrice(
            addedObj.price
          )}.\`\`\``
        );

      let str = `<@${addedObj.by}>\nNEW LISTING:\`\`\`${addedObj.itemID}:${addedObj.itemName}\
          \n${utils.printArrAsTable(
            scrappedData,
            addedObj.itemType,
            addedObj.equipLocation
          )}@ws ${addedObj.itemID}\`\`\``;
      bot.sendMsg(utils.defaults.NOTIF_CHANNEL_ID, str);
    } else {
      const delMsg = await msg.reply(`Deleting #${listingInfo.itemID} in your list...`);
      const delObj = await wl.rmFromWatchList(listingInfo.userID, listingInfo.itemID);
      delMsg.delete();
      utils.printReply(msg, delObj);
      if (delObj.status === 'rm' && globalVend[delObj.by]) {
        // delete old Cron job and delete hashed ids.
        cron.destroyCron(`${delObj.by}${delObj.itemID}`);
        globalVend[delObj.by][delObj.itemID] = {};
      }
    }
  } catch (e) {
    console.error(e);
    bot.sendMsg(utils.defaults.BOT_CHANNEL_ID, `<@${utils.defaults.DEBUG_USER_ID}> ` + e);
  }
}

module.exports = {
  run,
};
