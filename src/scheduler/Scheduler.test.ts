import {SchedulerCallBack} from '../ts/types/SchedulerCallback';
import Scheduler from './Scheduler';
import addMinutes from 'date-fns/addMinutes';
import subMinutes from 'date-fns/subMinutes';
import getUnixTime from 'date-fns/getUnixTime';
import fromUnixTime from 'date-fns/fromUnixTime';
import {Watchlist} from '../ts/interfaces/Watchlist';

const mock: SchedulerCallBack = async function (wl: Watchlist) {
  const {itemID, recurrence, nextOn, setOn} = wl;
  const date = getUnixTime(new Date());
  console.log(`Ran!. On: ${fromUnixTime(date)}`);
  return wl;
};

const fakeWL: Watchlist = {
  itemID: '6635',
  itemName: 'BSB',
  recurrence: 30,
  setByID: '123',
  setByName: 'vT',
  setOn: getUnixTime(new Date()),
  nextOn: getUnixTime(addMinutes(new Date(), 30)),
  createdOn: getUnixTime(subMinutes(new Date(), 5 * 1440)),
  subs: 1,
  server: 'HEL'
};

describe.skip('Testing Scheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('Called once in 59min with 30min reccurence', () => {
    const callbackMock = jest.fn(mock);
    Scheduler.createJob(fakeWL, callbackMock);

    expect(callbackMock).not.toBeCalled();

    jest.advanceTimersByTime(30 * 60000);

    expect(callbackMock).toBeCalled();
    expect(callbackMock).toHaveBeenCalledTimes(1);
  });

  test.skip('Called twice in 1hr with 30min reccurence', () => {
    const callbackMock = jest.fn(mock);
    Scheduler.createJob(fakeWL, callbackMock);

    expect(callbackMock).not.toBeCalled();

    jest.advanceTimersByTime(30 * 60000);
    
    expect(callbackMock).toBeCalled();
    expect(callbackMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(35 * 60000);
    expect(callbackMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(35 * 60000);
  });
});
