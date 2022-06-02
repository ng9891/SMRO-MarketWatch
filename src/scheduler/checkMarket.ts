import {sendMsgBot} from '../discord/discord';
import {getSubs} from '../db/actions/watchlist.action';
import {addToHistory, getHistory} from '../db/actions/history.action';
import {scrapeItem} from '../scraper/scraper';
import {QuerySnapshot, QueryDocumentSnapshot} from 'firebase-admin/firestore';
import {Watchlist} from '../ts/interfaces/Watchlist';
import {VendInfo} from '../ts/interfaces/VendInfo';
import {List} from '../ts/interfaces/List';
import {SchedulerCallBack} from '../ts/types/SchedulerCallback';
import {getNotificationMsg} from '../discord/responses/valid.response';
import {isSameRefinement, isItemAnEquip, vendsNotInHistory} from '../helpers/helpers';
import {subDays} from 'date-fns';

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

    const server = sub.server;
    if (notifArr.length > 0) {
      const msg = getNotificationMsg(sub.userID, notifArr, server, isEquip);
      await sendMsgBot(msg, channelID);
    }
  });
};

export const checkMarket: SchedulerCallBack = async function (wl: Watchlist): Promise<Watchlist> {
  const channelID = process.env.DISCORD_CHANNEL_ID;
  const logMsg = process.env.LOG_RUNNING_MESSAGE && process.env.LOG_RUNNING_MESSAGE === 'true' ? true : false;
  try {
    if (!channelID) throw new Error('No channel ID found.');

    const {itemID, itemName, server} = wl;

    if (logMsg) await sendMsgBot(`\`\`\`Running [${itemID}:${itemName}]\`\`\``, channelID);

    const subs = await getSubs(itemID, server);
    if (!subs) return wl;
    const subCount = subs.size as number;

    const scrape = await scrapeItem(itemID, itemName, server);
    const vends = scrape?.vends;
    if (!vends || vends.length === 0) return {...wl, subs: subCount};

    const historyDays = Number(process.env.HISTORY_FROM_DAYS);
    const daysDiff = isNaN(historyDays) || historyDays === 0 ? 30 : historyDays;
    const fromDate = subDays(new Date(), daysDiff);
    const history = await getHistory(itemID, fromDate, server);
    const historyHashes = history ? history : [];
    const newVends = vendsNotInHistory(vends, historyHashes);

    const isEquip = isItemAnEquip(scrape.type, scrape.equipLocation);

    await notifySubs(subs, newVends, isEquip);
    await addToHistory(newVends, scrape.timestamp, server);

    if (logMsg) await sendMsgBot(`\`\`\`Finished [${itemID}:${itemName}]\`\`\``, channelID);

    // Returning Watchlist for the next job.
    return {...wl, subs: subCount};
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
    if (channelID) await sendMsgBot(err.message, channelID);
    return wl;
  }
};
