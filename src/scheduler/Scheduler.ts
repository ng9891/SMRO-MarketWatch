import schedule from 'node-schedule';
import {Watchlist} from '../ts/interfaces/Watchlist';
import {SchedulerCallBack} from '../ts/types/SchedulerCallback';
import fromUnixTime from 'date-fns/fromUnixTime';
import {updateWatchList} from '../db/actions/watchlist.action';

const Scheduler = (() => {
  const scheduleArr = new Map<string, schedule.Job>();

  const rescheduleJob = async (wl: Watchlist, cb: SchedulerCallBack) => {
    console.log('\n*********************************');
    console.log(`[${wl.itemID}:${wl.itemName}] Rescheduling...`);
    // Updating nextOn
    const newWL = await updateWatchList(wl);
    createJob(newWL, cb);
  };

  const _onJobSuccess = (wl: Watchlist, cb: SchedulerCallBack) => {
    rescheduleJob(wl, cb);
  };

  const _onJobCanceled = (item: string) => {
    const date = new Date();
    console.log(`[${item}] cancelled on: ${date}`);
  };

  const createJob = async (wl: Watchlist, cb: SchedulerCallBack) => {
    const {itemID, itemName, nextOn, setOn, recurrence} = wl;
    const nextJobDate = fromUnixTime(nextOn);
    const isCancelled = cancelJob(itemID);
    if (!isCancelled) console.log(`\n[${itemID}:${itemName}] Job is not running.`);

    const newJob = schedule.scheduleJob(nextJobDate, async function () {
      const date = new Date();
      console.log(`Running... [${itemID}:${itemName}] | now: ${date}`);
      return await cb(wl);
    });

    if (!newJob) throw new Error(`***Failed to create Job for: [${itemID}:${itemName}]***`);
    console.log(
      `[${itemID}:${itemName}] Created:${fromUnixTime(setOn)} | Recur:${recurrence}min | jobOn:${nextJobDate}`
    );

    newJob.on('success', (wl: Watchlist) => {
      if (!wl) return;
      _onJobSuccess(wl, cb);
    });

    newJob.on('canceled', () => {
      _onJobCanceled(`${itemID}:${itemName}`);
    });

    scheduleArr.set(itemID, newJob);
  };

  const cancelJob = (itemID: string) => {
    const job = scheduleArr.get(itemID);
    if (job) return job.cancel();
    return false;
  };

  return {
    createJob,
    cancelJob,
    rescheduleJob,
  };
})();

export default Scheduler;
