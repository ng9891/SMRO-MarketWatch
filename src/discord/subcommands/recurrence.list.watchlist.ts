import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {ButtonInteraction} from 'discord.js';
import Scheduler from '../../scheduler/Scheduler';
import {getRecurrenceMsg} from '../responses/valid.response';
import {JobInfo} from '../../ts/types/JobInfo';

export const recurrenceList: Subcommand = {
  data: new SlashCommandSubcommandBuilder().setName('list').setDescription('List of running jobs.'),
  run: async (interaction) => {
    if (interaction instanceof ButtonInteraction) return;
    await interaction.deferReply();
    const itemsMap = Scheduler.schedulerMap;

    const data = Array.from(itemsMap).map(([key, val]) => {
      const {wl, job} = val as JobInfo;
      const subs = wl.subs ? wl.subs : 1;
      const time = job.nextInvocation();

      // formatDistanceToNow giving 'invalid time' error. Remaking Date.
      const nextOn = time.getTime() / 1000;

      return {itemID: wl.itemID, itemName: wl.itemName, subs, recurrence: wl.recurrence, nextOn, server: wl.server};
    });

    const resp = getRecurrenceMsg(data);
    await interaction.editReply(resp);
  },
};
