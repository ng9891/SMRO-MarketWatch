import {List} from '../../ts/interfaces/List';
import {Command} from '../../ts/interfaces/Command';
import {SlashCommandBuilder} from '@discordjs/builders';
import scrapItemInfoByID from '../../scraper/scraper';
import {addSub, getWatchListInfo, setWatchListInfo} from '../../db/actions/watchlist.action';
import {getUserInfo, setUserInfo} from '../../db/actions/users.action';
import {parsePriceString} from '../../helpers/helpers';
import {getDefaultEmbed} from '../responses/valid.responses';
import {getInvalidPriceFormatMsg, getInvalidMaxPriceMsg, getMaxListSizeMsg} from '../responses/invalid.responses';

const isMaxListSize = (listSize: number | undefined) => {
  if (!listSize) return false;
  if (listSize === Number(process.env.MAX_LIST_SIZE)) return true;
  return false;
};

export const add: Command = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adds/Updates an Item ID to/of the watchlist.')
    .addIntegerOption((option) =>
      option.setName('item-id').setDescription('ID of the Item. e.g 6635').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('threshold').setDescription('Price threshold for notifications. e.g 250m').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('refinement').setDescription('Minimum refinement of the equipment if applicable. e.g 11 or 12')
    ),
  run: async (interaction) => {
    try {
      await interaction.deferReply();
      const userID = interaction.user.id;
      const userName = interaction.user.username;
      const itemID = interaction.options.getInteger('item-id', true).toString();
      const threshold = interaction.options.getString('threshold', true);
      const refinement = interaction.options.getInteger('refinement')?.toString();
      const validPrice = parsePriceString(threshold);
      if (!validPrice) throw new Error(getInvalidPriceFormatMsg());

      const maxThreshold = Number(process.env.MAX_THRESHOLD);
      if (validPrice >= maxThreshold) throw new Error(getInvalidMaxPriceMsg());

      // Scraping item info
      const itemInfo = await scrapItemInfoByID(itemID);
      const newList: List = {
        itemID,
        threshold: validPrice,
        itemName: itemInfo.name,
        timestamp: itemInfo.timestamp,
        userID,
        userName,
      };
      if (refinement) newList.refinement = refinement;

      const user = await getUserInfo(userID);
      const isFull = isMaxListSize(user?.listSize);
      if (isFull) throw new Error(getMaxListSizeMsg(itemID, itemInfo.name, user?.list));
      const newUser = user
        ? await setUserInfo({...user, list: {...user.list, [itemID]: newList}})
        : await setUserInfo({userID, userName, list: {[itemID]: newList}});

      // Check if recurrence is set.
      let wl = await getWatchListInfo(itemID);
      if (!wl) {
        const recurrence = Number(process.env.DEFAULT_RECURRANCE_MINUTES);
        wl = await setWatchListInfo(recurrence, newUser, itemInfo);
      }

      await addSub(newList);
      const embed = getDefaultEmbed('ADD', wl, newUser.list);
      //TODO: set job.
      //TODO: Initial check?
      await interaction.editReply({embeds: [embed]});
    } catch (error) {
      const err = error as Error;
      // console.error(err);
      await interaction.editReply(err.message);
    }
  },
};
