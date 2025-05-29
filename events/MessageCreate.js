const { Events, Message } = require('discord.js');
const { EventModule, Owners } = require('../utils');

module.exports = EventModule({
  name: Events.MessageCreate,
  execute: async (client, message) => {
    if (message.author.bot || message.channel.type === ChannelType.DM) return;

    const prefix = process.env.PREFIX;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    let command = client.texts.get(cmd) || client.aliases.get(cmd);
    if (!command) return;

    if (command) {
      if (command.requiredRoles) {
        const { all, roles } = command.requiredRoles;
        let msg;
        if (all === true) {
          if (!message.member.roles.cache.hasAll(...roles)) {
            msg = await message.reply({
              content: `⚠️ You do not have the required roles to use this command!`
            });
          }
        } else {
          if (!message.member.roles.cache.hasAny(...roles)) {
            msg = await message.reply({
              content: `⚠️ You do not have any of the required roles to use this command!`
            });
          }
        }
        if (msg) {
          setTimeout(async () => {
            await msg.delete();
            if (message.deletable) await message.delete();
          }, 5000);
          return;
        }
      }

      const cooldownUsage = command.cooldown;

      if (cooldownUsage) {
        const result = await getResult(message, cooldownUsage);
        console.log(result);
        if (result !== true) {
          return;
        }
      }
      await command.run(client, message, args);
    }
    /**
     *
     * @param {Message<boolean} message
     * @param {Omit<import('../utils/types.d.ts').InternalCooldownConfig, 'userId' | 'actionId' | 'guildId' | 'channelId'>} usage
     * @returns
     */
    async function getResult(message, usage) {
      const cooldowns = client.cooldowns;
      let actionId = `prefixCommand_${cmd}`;

      const cooldownUsage = {
        cooldownType: usage.cooldownType,
        duration: usage.duration,
        userId: message.author.id,
        actionId,
        guildId: message.guildId,
        channelId: message.channelId
      };
      const result = await cooldowns.start(cooldownUsage);
      if (result === false) return client.log.warn(`Cooldown returned: false`);
      if (typeof result === 'object') {
        await client.users.cache
          .get(Array.isArray(Owners) ? Owners[0] : Owners)
          ?.send({
            content: result.main
          })
          .catch(() => client.log.warn(`Failed to send cooldown message to owner: ${result.main}`));
        return await message.reply({
          content: result.reply
        });
      } else if (typeof result === 'string') {
        return await message.reply({
          content: result
        });
      } else return true;
    }
  }
});
