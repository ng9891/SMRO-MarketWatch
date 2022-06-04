import dotenv from 'dotenv';
import {deployDiscordBot} from './discord/discord';
import {getActiveWatchLists, updateWatchLists} from './db/actions/watchlist.action';
import Scheduler from './scheduler/Scheduler';
import {checkMarket} from './scheduler/checkMarket';
import {Watchlist} from './ts/interfaces/Watchlist';

dotenv.config({path: './conf/.env'});

(async () => {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;
  const maxThreshold = process.env.MAX_THRESHOLD;
  const thumbURL = process.env.THUMBNAIL_URL;
  const maxListSize = process.env.MAX_LIST_SIZE;
  const recurr = process.env.DEFAULT_RECURRANCE_MINUTES;
  const channelID = process.env.DISCORD_CHANNEL_ID;
  const permission = process.env.DISCORD_PERMISSION;
  const urlHel = process.env.URL_HEL;
  const urlNif = process.env.URL_NIF;
  const urlHelItem = process.env.URL_HEL_ITEM;
  const urlNifItem = process.env.URL_HEL_ITEM;

  if (!token) return console.error('No DISCORD_TOKEN found');
  if (!clientId) return console.error('No DISCORD_CLIENT_ID found');
  if (!guildId) return console.error('No DISCORD_GUILD_ID found');
  if (!channelID) return console.error('No DISCORD_CHANNEL_ID found.');
  if (!permission) return console.error('No DISCORD_PERMISSION found.');
  if (!maxThreshold) return console.error('No MAX_THRESHOLD found');
  if (!urlHel) return console.error('No URL_HEL found');
  if (!urlNif) return console.error('No URL_NIF found');
  if (!urlHelItem) return console.error('No URL_HEL_ITEM found');
  if (!urlNifItem) return console.error('No URL_HEL_ITEM found');
  if (!thumbURL) return console.error('No THUMBNAIL_URL found');
  if (!maxListSize) return console.error('No MAX_LIST_SIZE found');
  if (!recurr) return console.error('No DEFAULT_RECURRANCE_MINUTES found');

  await deployDiscordBot(token);

  // Rerunning all jobs.
  const watchlists = await getActiveWatchLists();
  if (watchlists.empty) return;

  const batch = watchlists.docs.map((snap) => snap.data() as Watchlist);
  const updatedBatch = await updateWatchLists(batch);

  updatedBatch.forEach((wl) => {
    Scheduler.createJob(wl, checkMarket);
  });
})();
