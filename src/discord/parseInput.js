const utils = require('../utils/utils.js');
const {helpMsg} = require('../utils/helpMsg');
const {printTracking} = require('../utils/printTracking');
const wl = require('../watchlist/watchlist');
let {globalVend} = require('../globalVendObj');
const cron = require('../scheduler/scheduler');
const bot = require('./discord');

/**
 * Parse the command issued to the bot and extract {price, time} if available.
 * @param {*} cmd command input.
 * @return {Object} contains the argument {price, time}.
 */
function getArgs(cmd) {
  let args = cmd.match(/-{1,2}[A-z]+/g);
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

  args = cmd.match(/-{1,2}[A-z]+=\w+/g);
  // console.log(args);

  const shortPrice = args.filter((flag) => flag.startsWith('-p='));
  const longPrice = args.filter((flag) => flag.startsWith('--price='));

  const shortTime = args.filter((flag) => flag.startsWith('-t='));
  const longTime = args.filter((flag) => flag.startsWith('--time='));

  if (shortPrice[0] && longPrice[0]) throw 'Cannot use `-p` and `--price` at the same time.';
  if (shortTime[0] && longTime[0]) throw 'Cannot use `-t` and `--time` at the same time';

  args = cmd.replace(/(\+|\-)\d+/g, '').trim().split(' ');
  // console.log(args);
  if (args.length > 10) throw 'Too many arguments.'; // Too many arguments
  for (let arg of args) {
    if (arg.startsWith('--price=') || arg.startsWith('-p='))
      argObj.price = utils.parsePrice(arg.slice(arg.lastIndexOf('=') + 1));
    if (arg.startsWith('--time=') || arg.startsWith('-t='))
      argObj.time = Number.parseInt(arg.slice(arg.lastIndexOf('=') + 1), 10);
  }
  return argObj;
}

async function parseInput(msg) {
  const msgClean = msg.content.toLowerCase().trim();

  const subCommand = msg.content.split(' ')[1];
  switch (subCommand) {
    case 'list':
      const data = await printTracking(msg.author.id).catch((e) => {
        // console.error(e);
        return bot.sendMsg(utils.defaults.BOT_CHANNEL_ID, '@Vulty LIST CMD ' + e);
      });
      return msg.reply(`\`\`\`${data}\`\`\``);
      break;
    case 'reset':
      const status = await wl.clearWatchList(msg.author.id).catch((e) => {
        return bot.sendMsg(utils.defaults.BOT_CHANNEL_ID, '@parseInputAndRun: RESET Command ' + e);
      });

      globalVend[msg.author.id] = {}; // Delete Global hash table

      // Delete CRON
      let cronJobs = cron.getCronList(msg.author.id);
      for (cronID in cronJobs) {
        console.log(cronID);
        cronJobs[cronID].cancel();
        console.log('Canceled: ', cronID);
      }
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
    return bot.sendMsg(utils.defaults.BOT_CHANNEL_ID, `<@${msg.author.id}>\n ${e}`);
  }

  let listingInfo = {
    price: argObj.price,
    time: argObj.time,
    itemID: Number(itemID.match(/\d+/)[0]), // Match only digits without +/-. e.g. +1234 -> 1234
    userID: msg.author.id,
    username: msg.author.username,
  };

  if (itemID.startsWith('+')) return {command: 'add', listingInfo};
  return {command: 'delete', listingInfo};
}

module.exports = {
  parseInput,
};
