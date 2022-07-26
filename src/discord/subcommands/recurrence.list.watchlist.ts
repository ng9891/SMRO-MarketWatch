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

    const data = await Array.from(itemsMap).map(([key, val], idx) => {
      const {wl, job} = val as JobInfo;
      const subs = wl.subs ? wl.subs : 1;
      let time = job.nextInvocation();

      if (!time) {
        console.log(`No next invocation time found for itemID: ${wl.itemID} | ${itemsMap.size} jobs`);
        time = new Date();
      }
      // formatDistanceToNow giving 'invalid time' error. Remaking Date.
      const nextOn = time.getTime() / 1000;

      return {itemID: wl.itemID, itemName: wl.itemName, subs, recurrence: wl.recurrence, nextOn, server: wl.server};
    });

    const resp = getRecurrenceMsg(data);
    await interaction.editReply(resp);
  },
};
