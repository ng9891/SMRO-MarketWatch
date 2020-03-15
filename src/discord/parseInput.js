const utils = require('../utils/utils.js');
const {helpMsg} = require('../utils/helpMsg');
const {printTracking} = require('../utils/printTracking');
const wl = require('../watchlist/watchlist');
const {checkForNewEntry} = require('../check');
let {globalVend} = require('../globalVendObj');
// const {run} = require('./index');

function getArgs(msgClean) {
  let args = msgClean.match(/-{1,2}[A-z]+/g);
  let argObj = {
    price: utils.defaults.PRICE_THRESHOLD,
    time: utils.defaults.CRON_TIME,
  };
  if (!args) return argObj; // No args

  const validFlags = ['-p', '--price', '-t', '--time'];
  const invalidFlags = args.filter((flag) => {
    const flagWithoutEquals = flag.match(/-{1,2}[A-z]/);
    if (flagWithoutEquals) {
      return !validFlags.includes(flagWithoutEquals[0]);
    }
  });
  // console.log('invalidFlags', invalidFlags);
  if (invalidFlags[0]) throw 'Invalid flags detected. For more help, run `!wl help`';

  args = msgClean.match(/-{1,2}[A-z]+=\w+/g);

  const shortPrice = args.filter((flag) => flag.startsWith('-p='));
  const longPrice = args.filter((flag) => flag.startsWith('--price='));

  const shortTime = args.filter((flag) => flag.startsWith('-t='));
  const longTime = args.filter((flag) => flag.startsWith('--time='));

  if (shortPrice[0] && longPrice[0]) throw 'Cannot use `-p` and `--price` at the same time.';
  if (shortTime[0] && longTime[0]) throw 'Cannot use `-t` and `--time` at the same time';

  if (args.length > 10) throw 'Too many arguments.'; // Too many arguments
  for (let arg of args) {
    if (arg.startsWith('--price=') || arg.startsWith('-p='))
      argObj.price = utils.parsePrice(arg.slice(arg.lastIndexOf('=') + 1));
    if (arg.startsWith('--time=') || arg.startsWith('-t='))
      argObj.time = Number.parseInt(arg.slice(arg.lastIndexOf('=') + 1), 10);
  }
  return argObj;
}

// TODO: Refactor
async function parseInputAndRun(msg) {
  // const notifChannel = msg.guild.channels.cache.get('687263659885330486');
  const myID = '105899837517475840';
  const notifChannel = msg.guild.channels.cache.get('688684846419148811');
  const botChannel = msg.guild.channels.cache.get('688684846419148811');
  const msgClean = msg.content.toLowerCase().trim();

  const subCommand = msg.content.split(' ')[1];
  switch (subCommand) {
    case 'list':
      const data = await printTracking(msg.author.id).catch((e) => {
        // console.error(e);
        return botChannel.send('@Vulty LIST CMD ' + e);
      });
      return msg.reply(`\`\`\`${data}\`\`\``);
      break;
    case 'reset':
      const status = await wl.clearWatchList(msg.author.id).catch((e) => {
        return botChannel.send('@Vulty: RESET CMD ' + e);
      });
      // TODO: Delete CRON
      globalVend[msg.author.id] = {}; // Delete Global hash table
      return utils.printReply(msg, {status});
      break;
    case 'help':
      return msg.reply(helpMsg());
      break;
  }

  let itemID = msgClean.match(/(\+|\-)\d+/); // Match first item ID on string.
  if (!itemID) return msg.reply('Please specify an item ID. For more help, run `!wl help`');
  itemID = itemID[0];

  // Get args
  let argObj;
  try {
    argObj = getArgs(msgClean);
  } catch (e) {
    console.error(e);
    return botChannel.send(`<@${msg.author.id}>\n ${e}`);
    // return msg.reply(e);
  }

  let listingInfo = {
    price: argObj.price,
    time: argObj.time,
    itemID: Number(itemID.match(/\d+/)[0]), // Match only digits without +/-. e.g. +1234 -> 1234
    userID: msg.author.id,
    username: msg.author.username,
  };

  try {
    // Decide to add or remove
    if (itemID.startsWith('+')) {
      const addMsg = await msg.reply(`Adding ${listingInfo.itemID} to your list...`);
      const addedObj = await wl.addToWatchList(listingInfo);
      addMsg.delete();
      utils.printReply(msg, addedObj);
      if(addedObj.status === 'notFound') return;
      else if (addedObj.status === 'overwrite' && globalVend[addedObj.by]) {
        // delete old Cron job and delete hashed ids.
        // TODO: delete old Cron job
        globalVend[addedObj.by][addedObj.itemID] = {};
      }

      // TODO: new CRON
      const waitMsg = await msg.reply('Getting Initial Scrap...');
      const scrappedData = await checkForNewEntry(addedObj.by, addedObj.itemID);
      waitMsg.delete();

      if (scrappedData.length < 1)
        return notifChannel.send(
          `<@${addedObj.by}>\`\`\`No listing found <= ${utils.formatPrice(addedObj.price)}.\`\`\``
        );

      let str = `<@${addedObj.by}>\nNEW LISTING:\`\`\`${addedObj.itemID}:${addedObj.itemName}\
          \n${utils.printArrAsTable(scrappedData, addedObj.itemType)}@ws ${addedObj.itemID}\`\`\``;
      notifChannel.send(str);
    } else {
      const delMsg = await msg.reply(`Deleting ${listingInfo.itemID} in your list...`);
      const delObj = await wl.rmFromWatchList(listingInfo.userID, listingInfo.itemID);
      delMsg.delete();
      utils.printReply(msg, delObj);
      if (delObj.status === 'rm' && globalVend[delObj.by]) {
        // delete old Cron job and delete hashed ids.
        // TODO: delete old Cron job
        globalVend[delObj.by][delObj.itemID] = {};
      }
    }
  } catch (e) {
    console.error(e);
    botChannel.send(`<@${myID}> ` + e);
  }
}

module.exports = {
  parseInputAndRun,
};