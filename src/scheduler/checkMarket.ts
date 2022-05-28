import {Watchlist} from '../ts/interfaces/Watchlist';
import {SchedulerCallBack} from '../ts/types/SchedulerCallback';
import {sendMsgBot} from '../discord/discord';

export const checkMarket: SchedulerCallBack = async function (wl: Watchlist) {
  const {itemID, itemName, recurrence, nextOn, setOn} = wl;

  if (process.env.LOG_RUNNING_MESSAGE) {
    const channelID = process.env.DISCORD_CHANNEL_ID;
    if (!channelID) throw new Error('No channel ID found.');
    sendMsgBot(`\`\`\`Running [${itemID}:${itemName}]\`\`\``, channelID);
  }

  //TODO: check subs and add history.
  
  return wl;
};
