import {SubsCache} from '../../ts/interfaces/SubsCache';
import {ServerName} from '../../ts/types/ServerName';
import fromUnixTime from 'date-fns/fromUnixTime';
import {List} from '../../ts/interfaces/List';
import {getSubs} from '../actions/watchlist.action';
import {isCacheOld} from '../../helpers/helpers';

const CacheSubs = (() => {
  const subsCache = new Map<string, SubsCache>();

  const setSubsCache = (itemID: string, server: ServerName, lists: List[], lastSubChangeOn: number) => {
    const date = fromUnixTime(lastSubChangeOn);
    const newCache = {itemID, server, lastSubChangeOn: date, data: lists};
    subsCache.set(server + itemID, newCache);
  };

  const getSubsCache = async (itemID: string, server: ServerName, lastSubChangeOn: number) => {
    const cache = subsCache.get(server + itemID);

    if (!cache) {
      const docs = await getSubs(itemID, server);
      const newCache = docs ? docs : [];
      setSubsCache(itemID, server, newCache, lastSubChangeOn);
      return newCache;
    }

    if (!isCacheOld(lastSubChangeOn, cache.lastSubChangeOn, 5)) {
      console.log(`[${server} | ${itemID}] Subs are retrieved from cache`);
      return cache.data;
    }

    const newSubList = await getSubs(itemID, server);
    if (!newSubList) return cache.data;

    setSubsCache(itemID, server, newSubList, lastSubChangeOn);
    return cache.data;
  };

  const deleteCache = (itemID: string, server: ServerName) => {
    subsCache.delete(server + itemID);
  };

  return {
    setSubsCache,
    getSubsCache,
    deleteCache,
  };
})();

export default CacheSubs;
