import { Watchlist } from "../ts/interfaces/Watchlist";
import { SchedulerCallBack } from "../ts/types/SchedulerCallback";

export const checkMarket: SchedulerCallBack = async function (wl: Watchlist) {
  const {itemID, itemName, recurrence, nextOn, setOn} = wl;
  //TODO: check subs and add history.

  return wl;
};