export const getSelectFromAutocompleteMsg = () => {
  return 'Invalid Server Option. Please use the autocomplete results';
};

export const getInvalidPriceFormatMsg = () => {
  return 'Invalid threshold. Please us the correct format. Example: `250m` or `1.5k` or `1500`';
};

export const getInvalidMaxPriceMsg = () => {
  return 'Invalid threshold. Please input a threshold less than `2b`';
};

import {AppUser} from '../../ts/interfaces/AppUser';

const printAppUserList = (list: AppUser['list']) => {
  if (!list || Object.keys(list).length === 0) return 'Empty List';
  let str = '';
  for (const [key, value] of Object.entries(list)) {
    str += `\n${key}: ${value.itemName}`;
  }
  return str;
};

export const getMaxListSizeMsg = (itemID: string, itemName = '', list: AppUser['list']) => {
  let str = `\nFailed to add: [${itemID}: ${itemName}]. \nYour list is full. Please remove an item from your list:`;
  if (!list) return str;
  str += '```';
  str += printAppUserList(list);
  str += '```';
  str += `Total of ${Object.keys(list).length} out of ${process.env.MAX_LIST_SIZE}.`;
  return str;
};

export const getItemNotOnListMsg = (itemID: string, list: AppUser['list']) => {
  let str = `\nFailed to remove: [${itemID}]. ItemID is not in the list:\n`;
  if (!list) return str;
  str += '```';
  str += printAppUserList(list);
  str += '```';
  str += `Total of ${Object.keys(list).length} out of ${process.env.MAX_LIST_SIZE}.`;
  return str;
};

export const getNoPermissionMsg = () => {
  return '```You do not have enough permission to use this command. Please contact an administrator if you need help.```';
};

export const getNotInWatchlistMsg = (itemID: string) => {
  return `[ItemID:\`${itemID}\`] is not in the watch list.`;
};
