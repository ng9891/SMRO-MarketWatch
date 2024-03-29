import {VendInfo} from '../ts/interfaces/VendInfo';
import {ServerName} from '../ts/types/ServerName';
import addMinutes from 'date-fns/addMinutes';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import fromUnixTime from 'date-fns/fromUnixTime';
import {QueryDocumentSnapshot, QuerySnapshot} from 'firebase-admin/firestore';
import {SelectMenuInteraction, ButtonInteraction} from 'discord.js';

export const cleanShopText = (text: string): string => {
  return text
    .split(/\n|\\n/)
    .reduce((prev, str) => {
      if (!str) return prev;
      if (str === '( Enchant )') return prev;
      if (str === 'None') return (prev += '-');
      return (prev += ' ' + str.trim());
    }, '')
    .trim();
};

export const cleanShopPrice = (text: string): number => {
  return Number(text.replace(/\( Enchant \)/, '').replace(/\\n|,|\s|z/g, ''));
};

export const convertToThousands = (num: number): number => {
  return num * 1000;
};

export const convertToMillions = (num: number): number => {
  return num * 1000000;
};

export const convertToBillions = (num: number): number => {
  return num * 1000000000;
};

export const checkValidPriceString = (price: string): string | null => {
  const regex = /^\d+(\.?\d*)?[k|m|b]?$/g;
  const found = price.match(regex);
  return found ? found[0] : null;
};

export const parsePriceString = (price: string): number | null => {
  const valid = checkValidPriceString(price);
  if (!valid) return null;
  const num = Number.parseFloat(valid);
  if (isNaN(num)) return null;
  if (price.endsWith('b')) return convertToBillions(num);
  if (price.endsWith('m')) return convertToMillions(num);
  if (price.endsWith('k')) return convertToThousands(num);
  return num;
};

export const displayInThousands = (num: number): string => {
  return parseFloat((num / 1000).toFixed(2)) + 'k';
};

export const displayInMillions = (num: number): string => {
  return parseFloat((num / 1000000).toFixed(2)) + 'm';
};

export const displayInBillions = (num: number): string => {
  return parseFloat((num / 1000000000).toFixed(2)) + 'b';
};

export const formatPrice = (num: number): string => {
  if (num <= 0) return '0';
  if (num < 1000000) return displayInThousands(num);
  if (num < 1000000000) return displayInMillions(num);
  return displayInBillions(num);
};

export const calculateVendHash = (vend: Omit<VendInfo, 'hash' | 'server' | 'timestamp'>): string => {
  const {itemID, shopID, shopName, price, refinement, merchant, position} = vend;
  let vendor = '';
  if (merchant) vendor = merchant?.replace(/\s/g, '') + position?.replace(/\s/g, '');
  const name = shopName ? shopName.split(' ').join('') : `${shopID}?${refinement}?${itemID}`;
  return `${refinement}${itemID}${shopID}${name}${price}${vendor}`;
};

export const calculateNextExec = (start: number | Date, current: number | Date, recurrence: number): Date => {
  const started = start instanceof Date ? start : fromUnixTime(start);
  const now = current instanceof Date ? current : fromUnixTime(current);
  if (started > now) return started;
  if (recurrence < 0) return now;
  const diff = differenceInMinutes(now, started);
  const addAmount = recurrence * Math.floor(diff / recurrence);
  const newStartPoint = addMinutes(started, addAmount);
  return addMinutes(newStartPoint, recurrence);
};

export const isSameRefinement = (userRefine: string, vendRefine: string): boolean => {
  const userRefinement = Number(userRefine.match(/\d+/g));
  const vendRefinement = Number(vendRefine.match(/\d+/g));
  return userRefinement === vendRefinement;
};

export const isItemAnEquip = (itemType: string, equipLocation: string): boolean => {
  if (itemType === 'Card' || itemType === 'Etc' || equipLocation === '-') return false;
  return true;
};

export const checkHashInHistory = (hash: string, hashesArr: VendInfo[] | QuerySnapshot | string[]): boolean => {
  const hashes = hashesArr instanceof QuerySnapshot ? hashesArr.docs : hashesArr;
  return hashes.some((history) => {
    const historyHash = history instanceof QueryDocumentSnapshot ? history.data() : history;
    if (typeof historyHash === 'string') return historyHash === hash;
    return historyHash.hash && historyHash.hash === hash;
  });
};

import {getUnixTime} from 'date-fns';
import {AppUser} from '../ts/interfaces/AppUser';
export const vendsNotInHistory = (vend: VendInfo[], history: VendInfo[] | string[]): VendInfo[] => {
  const filtered = vend.reduce<VendInfo[]>((prev, curr) => {
    const {hash} = curr;
    const checkedHash = hash ? hash : calculateVendHash(curr);
    const isIn = checkHashInHistory(checkedHash, history);
    if (!isIn) prev.push(curr);
    return prev;
  }, []);

  const itemID = vend[0].itemID;
  const itemName = vend[0].itemName;
  const now = getUnixTime(new Date());
  const vendLog = vend.map((v) => v.hash);
  const resull = filtered.map((v) => v.hash);
  const historyLog = history.map((h) => {
    return typeof h === 'string' ? h : h.hash;
  });

  console.log(
    `**${now} |${itemID}:${itemName}: history: ${JSON.stringify(historyLog)}\nvendScraped: ${JSON.stringify(
      vendLog
    )}\nResult: ${JSON.stringify(resull)}`
  );

  return filtered;
};

export const isCacheOld = (lastUpdated: Date | number, lastUpdatedCache: Date | number, diffInSec: number): boolean => {
  const date1 = lastUpdated instanceof Date ? lastUpdated : fromUnixTime(lastUpdated);
  const date2 = lastUpdatedCache instanceof Date ? lastUpdatedCache : fromUnixTime(lastUpdatedCache);
  return differenceInSeconds(date1, date2, {roundingMethod: 'floor'}) > diffInSec;
};

export const parseListingEmbed = (interaction: SelectMenuInteraction | ButtonInteraction) => {
  const embed = interaction.message.embeds[0];
  if (!embed || !embed.fields) return {};

  const title = embed.title ? embed.title.split(':') : undefined;

  const obj = {server: '' as ServerName, threshold: '', refinement: ''};
  embed.fields.map(({name, value}) => {
    if (name === 'Server') obj['server'] = value as ServerName;
    if (name === 'Threshold') obj['threshold'] = value;
    if (name === 'Refinement') obj['refinement'] = value;
  });

  const {server, threshold, refinement} = obj;
  if (!server || !title) return {};

  return {itemID: title[0].trim(), itemName: title[1].trim(), server, threshold, refinement};
};

export const sortUserWatchlist = (list: AppUser['list']) => {
  if (!list) return [];
  return Object.entries(list).sort(([k1, val1], [k2, val2]) => {
    if (val1.server > val2.server) return 1;
    if (val1.server < val2.server) return -1;
    return Number(val1.itemID) - Number(val2.itemID);
  });
};
