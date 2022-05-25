export const getInvalidPriceFormatMsg = () => {
  return 'Invalid threshold. Please us the correct format. Example: `250m` or `1.5k` or `1500`';
};

export const getInvalidMaxPriceMsg = () => {
  return 'Invalid threshold. Please input a threshold less than `2b`';
};

import {AppUser} from '../../ts/interfaces/AppUser';
export const getMaxListSizeMsg = (itemID: string, itemName = '', list: AppUser['list']) => {
  if (!list) throw new Error('List is empty in MaxListSizeMsg');
  let str = `\`\`\`Failed to add: [${itemID}: ${itemName}]. \nYour list is full. Please remove an item from your list:`;

  if (list) {
    for (const [key, value] of Object.entries(list)) {
      str += `\n${key}: ${value.itemName}`;
    }
  }

  str += '```';
  return str;
};

export const getNoPermissionMsg = () => {
  return '```You do not have enough permission to use this command. Please contact a administrator.```';
};

export const getNotInWatchlistMsg = (itemID: string) => {
  return `[ItemID:\`${itemID}\`] is not in the watch list.`;
};
