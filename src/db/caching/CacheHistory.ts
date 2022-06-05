import {HistoryCache} from '../../ts/interfaces/HistoryCache';
import {ServerName} from '../../ts/types/ServerName';
import fromUnixTime from 'date-fns/fromUnixTime';
import subDays from 'date-fns/subDays';
import {getHistory} from '../actions/history.action';
import {VendInfo} from '../../ts/interfaces/VendInfo';
import {getUnixTime} from 'date-fns';
import {isCacheOld} from '../../helpers/helpers';

const historyDays = Number(process.env.HISTORY_FROM_DAYS);

const CacheHistory = (() => {
  const DAYS_KEEP_HISTORY = isNaN(historyDays) || historyDays === 0 ? 30 : historyDays;
  const historyCache = new Map<string, HistoryCache>();

  const setHistoryCache = (itemID: string, server: ServerName, vends: VendInfo[], lastUpdated: number) => {
    const date = fromUnixTime(lastUpdated);
    const newCache = {itemID, server, lastUpdated: date, data: vends};
    historyCache.set(server + itemID, newCache);
  };

  const updateHistoryCache = (itemID: string, server: ServerName, vends: VendInfo[], lastUpdated: number) => {
    const cache = historyCache.get(server + itemID);
    if (!cache) return false;
    const date = fromUnixTime(lastUpdated);
    const fromDate = getUnixTime(subDays(new Date(), DAYS_KEEP_HISTORY));
    const filteredCache = cache.data.filter((data) => (data.timestamp ? data.timestamp > fromDate : false));
    cache.data = [...vends, ...filteredCache];
    cache.lastUpdated = date;
    return true;
  };

  const getHistoryCache = async (itemID: string, server: ServerName, lastUpdated: number) => {
    const cache = historyCache.get(server + itemID);

    if (!cache) {
      const fromDate = getUnixTime(subDays(new Date(), DAYS_KEEP_HISTORY));
      const docs = await getHistory(itemID, fromDate, server);
      const newCache = docs ? docs : [];
      setHistoryCache(itemID, server, newCache, lastUpdated);
      return newCache;
    }

    if (!isCacheOld(lastUpdated, cache.lastUpdated, 59)) return cache.data;

    const newInHistory = await getHistory(itemID, lastUpdated, server);
    if (!newInHistory) return cache.data;

    updateHistoryCache(itemID, server, newInHistory, lastUpdated);
    return cache.data;
  };

  const deleteCache = (itemID: string, server: ServerName) => {
    historyCache.delete(server + itemID);
  };

  return {
    setHistoryCache,
    updateHistoryCache,
    getHistoryCache,
    deleteCache,
  };
})();

export default CacheHistory;
