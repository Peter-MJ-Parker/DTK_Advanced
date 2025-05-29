const {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  PermissionsBitField,
  Events,
  InteractionType,
  ComponentType
} = require('discord.js');
const { containsUserId, EventModule, isOwner, Owners } = require('../utils');

module.exports = EventModule({
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    let module;
    let baseID =
      interaction.isCommand() || interaction.isAutocomplete()
        ? interaction.commandName
        : interaction.customId?.split(':')[0] ?? interaction.customId;

    if (interaction.isChatInputCommand()) {
      module = client.commands.get(baseID);
    } else if (interaction.isMessageContextMenuCommand()) {
      module = client.messageContextCommands.get(baseID);
    } else if (interaction.isUserContextMenuCommand()) {
      module = client.userContextCommands.get(baseID);
    } else if (interaction.isButton()) {
      module = client.buttons.get(baseID);
    } else if (interaction.isAnySelectMenu()) {
      module = client.menus.get(baseID);
    } else if (interaction.isModalSubmit()) {
      module = client.modals.get(baseID);
    }

    if (!module) {
      console.warn(`[INTERACTION_HANDLER]: No module found for ${interaction.type} (${baseID})`);
      return;
    }

    const error = await canRun(module, interaction);
    if (error) {
      await replyError(interaction, error);
      return;
    }

    try {
      const argsArray = getArgsArray(interaction);
      if (argsArray && containsUserId(interaction, argsArray)) {
        if (interaction.user.id !== argsArray[argsArray.length - 1]) {
          return await interaction.followUp({
            content: `⚠️ This interaction is not for you!`,
            flags: 64
          });
        }
      }
      await module.execute(client, interaction, ...argsArray);
    } catch (err) {
      await replyError(
        interaction,
        `There was an error while executing this interaction!\n\`\`\`${err.message || err}\`\`\``
      );
      client.log ? client.log.error(err) : console.error(err);
    }

    async function canRun(module, interaction) {
      if (module.admin && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return '⚠️ Only administrators can use this command!';
      }
      if (module.owner && !isOwner(interaction.user.id)) {
        return '⚠️ Only bot owners can use this command!';
      }
      if (module.requiredRoles) {
        const { all, roles } = module.requiredRoles;
        if (all === true) {
          if (!interaction.member.roles.cache.hasAll(...roles)) {
            return '⚠️ You do not have the required roles to use this command!';
          }
        } else {
          if (!interaction.member.roles.cache.hasAny(...roles)) {
            return '⚠️ You do not have any of the required roles to use this command!';
          }
        }
      }
      if (module.cooldown) {
        const result = await getResult(interaction, module.cooldown);
        if (result !== true) return result;
      }
      return null;
    }

    async function replyError(interaction, content) {
      const errorMessage = { content, flags: 64 };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (e) {
        client.log
          ? client.log.error('Failed to send error message:', e)
          : console.error('Failed to send error message:', e);
      }
    }

    function getArgsArray(interaction) {
      if (interaction.customId) {
        const [, args] = interaction.customId.split(':');
        return args ? [args.split('/')] : [];
      }
      return [];
    }

    async function getResult(interaction, usage) {
      const cooldowns = client.cooldowns;
      let actionId = '';
      if (
        interaction instanceof ChatInputCommandInteraction ||
        interaction instanceof ContextMenuCommandInteraction ||
        interaction instanceof UserContextMenuCommandInteraction
      ) {
        actionId = `command_${interaction.commandName}`;
      } else {
        switch (interaction.type) {
          case InteractionType.MessageComponent:
            switch (interaction.componentType) {
              case ComponentType.Button:
                actionId = `button_${interaction.customId}`;
                break;
              default:
                actionId = `menu_${interaction.customId}`;
                break;
            }
            break;
          case InteractionType.ModalSubmit:
            actionId = `modal_${interaction.customId}`;
            break;
        }
      }
      const cooldownUsage = {
        ...usage,
        userId: interaction.user.id,
        actionId,
        guildId: interaction.guildId,
        channelId: interaction.channelId
      };
      const result = await cooldowns.start(cooldownUsage);
      if (result === false) return 'Cooldown returned: false';
      if (typeof result === 'object') {
        await client.users.cache
          .get(Array.isArray(Owners) ? Owners[0] : Owners)
          ?.send({ content: result.main })
          .catch(() =>
            client.log
              ? client.log.warn(`Failed to send cooldown message to owner: ${result.main}`)
              : console.warn(`Failed to send cooldown message to owner: ${result.main}`)
          );
        return result.reply;
      } else if (typeof result === 'string') {
        return result;
      }
      return true;
    }
  }
});
