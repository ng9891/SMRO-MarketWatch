/**
 * Driver File.
 */
const path = require('path');
const fs = require('fs');
const utils = require('./utils/utils');
let {globalVend} = require('./globalVendObj');

require('./discord/discord'); // Runs BOT

utils
  .openJSONFile(`../save.json`)
  .then((data) => {
    console.log('Loaded to global Vend', data);
    Object.assign(globalVend, data);
  })
  .catch((e) => {
    console.log('"save.json" doesnt not exits.\nAll listing will be scrapped for the first time.');
  });

// Write to file when app is closed.
process.stdin.resume();
function exitHandler(options, err) {
  console.log('\nEXIT: ', err, options);
  try {
    console.log('GlobalVend: ', globalVend);
    fs.writeFileSync(path.resolve(__dirname, `./save.json`), JSON.stringify(globalVend));
    console.log('Saved');
  } catch (e) {
    console.error(e);
    console.log("Couldn't save globalVend on exit.");
  }
  process.kill(process.pid);
}

// Do something when app is closing
process.on('exit', exitHandler.bind(null, {exit: true}));
// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));
// Catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
