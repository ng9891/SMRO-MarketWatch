import schedule from 'node-schedule';
import {Watchlist} from '../ts/interfaces/Watchlist';
import {JobInfo} from '../ts/types/JobInfo';
import {SchedulerCallBack} from '../ts/types/SchedulerCallback';
import fromUnixTime from 'date-fns/fromUnixTime';
import {updateWatchLists} from '../db/actions/watchlist.action';
import {ServerName} from '../ts/types/ServerName';
import CacheHistory from '../db/cachers/CacheHistory';
import CacheSubs from '../db/cachers/CacheSubs';

const Scheduler = (() => {
  const schedulerMap = new Map<string, JobInfo>();

  const rescheduleJob = async (wl: Watchlist, cb: SchedulerCallBack) => {
    // Updating nextOn
    const updatedWl = await updateWatchLists([wl]);
    const newWl = updatedWl[0];
    createJob(newWl, cb);
    console.log('\n*********************************');
    console.log(`${wl.server} [${wl.itemID}:${wl.itemName}] Rescheduling to ${newWl.nextOn}`);
  };

  const _onJobSuccess = (wl: Watchlist, cb: SchedulerCallBack) => {
    rescheduleJob(wl, cb);
  };

  const createJob = async (wl: Watchlist, cb: SchedulerCallBack) => {
    const {itemID, itemName, nextOn, server} = wl;
    const nextJobDate = fromUnixTime(nextOn);
    const isCancelled = cancelJob(itemID, server);
    if (!isCancelled) console.log(`\n${server} | [${itemID}:${itemName}] Job is not running.`);

    const newJob = schedule.scheduleJob(nextJobDate, async function () {
      const date = new Date();
      console.log(`*${server} [${itemID}:${itemName}] Running... ${date}`);
      return await cb(wl);
    });

    if (!newJob) throw new Error(`***Failed to create Job for: ${server} | [${itemID}:${itemName}]***`);

    newJob.on('success', (wl: Watchlist) => {
      if (!wl) return;
      _onJobSuccess(wl, cb);
    });

    schedulerMap.set(server + itemID, {wl, job: newJob});
  };

  const cancelJob = (itemID: string, server: ServerName, deleteCache = false) => {
    const item = schedulerMap.get(server + itemID);
    if (item) {
      schedulerMap.delete(server + itemID);
      if (deleteCache) {
        CacheHistory.deleteCache(itemID, server);
        CacheSubs.deleteCache(itemID, server);
      }
      return item.job.cancel();
    }
    return false;
  };

  return {
    createJob,
    cancelJob,
    rescheduleJob,
    schedulerMap,
  };
})();

export default Scheduler;
