import {Client, TextChannel, MessageOptions} from 'discord.js';
import intent from './IntentOptions';
import {onInteraction} from './events/onInteraction';
import {onReady} from './events/onReady';

export const BOT = new Client({intents: intent});

export const deployDiscordBot = async (token: string) => {
  BOT.on('ready', async () => await onReady(BOT));
  BOT.on('interactionCreate', async (interaction) => await onInteraction(interaction));

  await BOT.login(token);
};

export const sendMsgBot = async (msg: string | MessageOptions, channelID: string) => {
  const channel = BOT.channels.cache.get(channelID);
  if (!channel) throw new Error('Failed to get channel,');
  if (channel.type !== 'GUILD_TEXT') throw new Error('Provided ChannelID is not a text channel,');
  const textChannel = channel as TextChannel;
  if (!msg) throw new Error('sendMsgBot was send empty message.');

  if (typeof msg === 'string') return await textChannel.send(msg);
  else {
    const sent = await textChannel.send(msg);
    setTimeout(() => {
      sent.edit({components: []});
    }, 10 * 60 * 1000);
  }
};
