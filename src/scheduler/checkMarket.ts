import {sendMsgBot} from '../discord/discord';
import {addToHistory, getHistoryStats} from '../db/actions/history.action';
import {getWatchListInfo} from '../db/actions/watchlist.action';
import {scrapeItem} from '../scraper/scraper';
import {QuerySnapshot, QueryDocumentSnapshot} from 'firebase-admin/firestore';
import {Watchlist} from '../ts/interfaces/Watchlist';
import {VendInfo} from '../ts/interfaces/VendInfo';
import {List} from '../ts/interfaces/List';
import {SchedulerCallBack} from '../ts/types/SchedulerCallback';
import {getNotificationMsg} from '../discord/responses/valid.response';
import {isSameRefinement, isItemAnEquip, vendsNotInHistory} from '../helpers/helpers';
import CacheHistory from '../db/caching/CacheHistory';
import CacheSubs from '../db/caching/CacheSubs';

export const notifySubs = async (subs: QuerySnapshot | List[], vends: VendInfo[], isEquip = true) => {
  const channelID = process.env.DISCORD_CHANNEL_ID;
  if (!channelID) throw new Error('No channel ID found.');

  subs.forEach(async (snap) => {
    const sub = snap instanceof QueryDocumentSnapshot ? (snap.data() as List) : snap;

    // Get vends below threshold
    const notifArr = [];
    for (const vend of vends) {
      // Vends are sorted. Faster than Array.reduce
      if (vend.price > sub.threshold) break;
      if (sub.refinement && !isSameRefinement(sub.refinement, vend.refinement)) continue;
      notifArr.push(vend);
    }

    if (notifArr.length > 0) {
      const msg = getNotificationMsg(sub.userID, sub.threshold, notifArr, isEquip, sub.refinement);
      await sendMsgBot(msg, channelID);
    }
  });
};

export const checkMarket: SchedulerCallBack = async function (wl: Watchlist): Promise<Watchlist> {
  const channelID = process.env.DISCORD_CHANNEL_ID;
  try {
    if (!channelID) throw new Error('No channel ID found.');

    const {itemID, itemName, server} = wl;

    const currWl = await getWatchListInfo(itemID, server);
    if (!currWl) return wl;

    let subs = [] as List[];
    if (currWl.lastSubChangeOn) subs = await CacheSubs.getSubsCache(itemID, server, currWl.lastSubChangeOn);

    if (subs.length === 0) return currWl;

    const scrape = await scrapeItem(itemID, itemName, server);
    const vends = scrape?.vends;
    if (!vends || !Array.isArray(vends) || vends.length === 0) return currWl;

    const stats = await getHistoryStats(itemID);
    let historyHashes = [] as VendInfo[];

    const lastUpdatedKey = server + 'lastUpdated';
    if (stats && stats[lastUpdatedKey]) {
      const lastUpdated = stats[lastUpdatedKey];
      historyHashes = await CacheHistory.getHistoryCache(itemID, server, lastUpdated);
    }

    const newVends = vendsNotInHistory(vends, historyHashes);

    if (newVends.length > 0) {
      const isEquip = isItemAnEquip(scrape.type, scrape.equipLocation);
      await notifySubs(subs, newVends, isEquip);
      await addToHistory(newVends, scrape.timestamp, server);
      CacheHistory.updateHistoryCache(itemID, server, newVends, scrape.timestamp);
    }

    // Returning Watchlist for the next job.
    return currWl;
  } catch (error) {
    console.error(error);
    console.trace('Trace ' + error);
    if (error instanceof Error) {
      let msg = error.message;
      if (!error.message) msg = error.toString();
      if (channelID) await sendMsgBot(msg, channelID);
    }

    return wl;
  }
};
