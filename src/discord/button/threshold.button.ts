import {ButtonInteraction, MessageButton, MessageButtonStyleResolvable} from 'discord.js';
import {formatPrice, parseListingEmbed} from '../../helpers/helpers';
import {add} from '../subcommands/add.watchlist';

const btnRowLength = 5;
const btnStyleArr = ['SUCCESS', 'DANGER', 'SECONDARY'];
const btnIconArr = ['⬆️', '⬇️', '❌'];

// Builts IDs: +20 +15 +10 etc...
export const btnIDArr = (() => {
  const arrID = [] as string[][];
  for (let i = 1; i <= btnRowLength; i++) {
    const steps = 5 * i;
    const id1 = `+${steps}`;
    const id2 = `-${steps}`;

    arrID[0] ? arrID[0].push(id1) : arrID.push([id1]);
    arrID[1] ? arrID[1].push(id2) : arrID.push([id2]);
  }
  return [...arrID[0], ...arrID[1], 'none'];
})();

export const generateThresholdBtn = (threshold: number) => {
  const threshArr = [] as number[];
  for (let i = 1; i <= btnRowLength; i++) {
    const steps = 5 * i;
    const percent = steps / 100;
    threshArr.push(threshold * percent);
  }

  const maxThreshold = Number(process.env.MAX_THRESHOLD);
  const btns = btnIDArr.map((id, idx) => {
    let label = '';
    let styleIndex = 0;
    const threshIdx = idx % threshArr.length;
    if (idx === btnIDArr.length - 1) {
      label = 'None';
      styleIndex = 2;
    } else if (idx < btnRowLength) {
      const thresh = threshArr[threshIdx] + threshold;
      const newThresh = thresh < maxThreshold ? thresh : maxThreshold;
      label = formatPrice(newThresh);
      styleIndex = 0;
    } else {
      const thresh = threshold - threshArr[threshIdx];
      const newThresh = thresh < maxThreshold ? thresh : maxThreshold;
      label = formatPrice(newThresh);
      styleIndex = 1;
    }

    return new MessageButton()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(btnStyleArr[styleIndex] as MessageButtonStyleResolvable)
      .setEmoji(btnIconArr[styleIndex]);
  });

  return btns;
};

export const changeThreshold = async (interaction: ButtonInteraction) => {
  const requestUserID = interaction.user.id;
  const author = interaction.message.content;
  const authorID = author.slice(2, author.length - 1);
  if (requestUserID !== authorID) {
    await interaction.reply({content: 'Sorry. You cannot interract with this listing', ephemeral: true});
    return;
  }

  await interaction.deferUpdate();

  const {threshold} = parseListingEmbed(interaction);
  if (!threshold) {
    await interaction.update({components: []});
    await interaction.followUp('Sorry. Could not find Embed information.');
    return;
  }

  await interaction.editReply({components: []});

  if (interaction.customId !== 'none') {
    await add.run(interaction);
  }
};
