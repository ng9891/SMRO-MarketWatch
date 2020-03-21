const path = require('path');
const Discord = require('discord.js');
const bot = new Discord.Client();
const {parseInput} = require('./parseInput');
const {run} = require('./run');
const {runInitialCronJob} = require('../scheduler/scheduler');
require('toml-require').install({toml: require('toml')});
const CONFIG = require(path.join(process.cwd(), 'conf/user_config.toml'));

bot.on('message', (msg) => {
  // Do nothing if you are a bot or a link
  if (msg.author.bot || msg.embeds.length > 0) return;
  if (msg.channel.type === 'dm') return msg.reply('Sorry commands not available on DMs');

  // Checking if its @wl
  if (msg.content.trim().slice(0, 4) === '!wl '){
    let input = parseInput(msg);
    return run(msg, input);
  } 
});

bot.on('error', (err) => {
  console.log(err);
});

bot
  .login(CONFIG.DISCORD_TOKEN)
  .then(() => {
    runInitialCronJob();
    console.log('Bot is connected and ready.');
  })
  .catch((err) => console.log(`Loggin error: [${Date.now()}]\n ${err}`));

function sendMsg(channelID, content) {
  bot.channels.cache.get(channelID).send(content);
}

module.exports = {
  sendMsg,
};
