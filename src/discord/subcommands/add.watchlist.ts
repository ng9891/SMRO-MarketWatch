import {List} from '../../ts/interfaces/List';
import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {scrapeItem} from '../../scraper/scraper';
import {addSub, getWatchListInfo, createNewWatchList} from '../../db/actions/watchlist.action';
import {getUserInfo, setUserInfo} from '../../db/actions/users.action';
import {setItemInfo} from '../../db/actions/items.action';
import {parsePriceString, isItemAnEquip, calculateNextExec} from '../../helpers/helpers';
import {getDefaultEmbed} from '../responses/valid.response';
import {getInvalidPriceFormatMsg, getInvalidMaxPriceMsg, getMaxListSizeMsg} from '../responses/invalid.response';
import {getSelectFromAutocompleteMsg} from '../responses/invalid.response';
import Scheduler from '../../scheduler/Scheduler';
import {checkMarket, notifySubs} from '../../scheduler/checkMarket';
import {ServerName} from '../../ts/types/ServerName';

const isListFull = (listSize: number | undefined) => {
  if (!listSize) return false;
  if (listSize < Number(process.env.MAX_LIST_SIZE)) return false;
  return true;
};

export const add: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName('add')
    .setDescription('Add/Update an Item ID to the watchlist.')
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('Decide which server to put the watchlist')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option.setName('item-query').setDescription('Find item.').setRequired(true).setAutocomplete(true)
    )
    .addStringOption((option) =>
      option.setName('threshold').setDescription('Price threshold for notifications. e.g 250m').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('refinement').setDescription('Minimum refinement of the equipment if applicable. e.g 11 or 12')
    ),
  run: async (interaction) => {
    await interaction.deferReply();
    const userID = interaction.user.id;
    const userName = interaction.user.username;
    const discriminator = interaction.user.discriminator;

    const serverQuery = interaction.options.getString('server');
    if (!serverQuery) return getSelectFromAutocompleteMsg();
    const server = serverQuery as ServerName;

    const query = interaction.options.getString('item-query');
    if (!query) return getSelectFromAutocompleteMsg();
    const [itemID, itemName] = query.split('=');
    if (!itemID || !itemName) return getSelectFromAutocompleteMsg();

    const threshold = interaction.options.getString('threshold', true);
    const refine = interaction.options.getInteger('refinement');
    const refinement = refine ? Math.abs(refine).toString() : null;
    const validPrice = parsePriceString(threshold);
    if (!validPrice) return getInvalidPriceFormatMsg();

    const maxThreshold = Number(process.env.MAX_THRESHOLD);
    if (validPrice >= maxThreshold) return getInvalidMaxPriceMsg();

    // Scraping item info
    const itemInfo = await scrapeItem(itemID, itemName, server);
    const newList = {
      itemID,
      userID,
      userName,
      server,
      itemName: itemInfo.name,
      timestamp: itemInfo.timestamp,
      threshold: validPrice,
    } as List;
    if (refinement) newList.refinement = refinement;

    const user = await getUserInfo(userID, userName, discriminator);
    const list = user.list;

    // If its not an item threshold update. Check for user list size
    if (list && !list[itemID]) {
      const isFull = isListFull(user.listSize);
      if (isFull) return getMaxListSizeMsg(itemID, itemInfo.name, user?.list);
    }

    const newUser = await setUserInfo({...user, list: {...user.list, [server + itemID]: newList}});
    await setItemInfo(itemInfo, userID);

    // Check if recurrence is set.
    let wl = await getWatchListInfo(itemID, server);
    if (!wl) {
      const recurrence = Number(process.env.DEFAULT_RECURRANCE_MINUTES);
      wl = await createNewWatchList(recurrence, newUser, itemInfo);
    }

    // Job is not running because it has 0 subs. Needs reschedule.
    if (!wl?.subs || wl.subs === 0) Scheduler.rescheduleJob({...wl, subs: 1}, checkMarket);

    const isNewSub = await addSub(newList);
    const action = isNewSub ? 'ADD' : 'UPDATE';
    const nextOn = calculateNextExec(wl.setOn, new Date(), wl.recurrence).getTime() / 1000;
    const embed = getDefaultEmbed(action, {...wl, nextOn}, newUser);

    await interaction.editReply({embeds: [embed]});
    if (itemInfo.vends && itemInfo.vends.length > 0)
      await notifySubs([newList], itemInfo.vends, isItemAnEquip(itemInfo.type, itemInfo.equipLocation));
  },
};
