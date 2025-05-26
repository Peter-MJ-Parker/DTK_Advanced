const { DTKExtendedClient, Owners } = require('.');
const {
  ChatInputCommandInteraction,
  ButtonInteraction,
  AnySelectMenuInteraction,
  ContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  ModalSubmitInteraction,
  InteractionType,
  ComponentType,
  Interaction,
  PermissionsBitField
} = require('discord.js');

/**
 * @param {DTKExtendedClient} client
 * @param {Interaction} interaction
 * @param {"buttons" | "modals" | "menus" | "commands"} type
 */
module.exports = async (client, interaction, type) => {
  let module;
  if (['buttons', 'modals', 'menus'].includes(type)) {
    const baseID = interaction.customId.split(':')[0] ?? interaction.customId;
    module = client[type].get(baseID);
  } else if (type === 'commands') {
    module = client.commands.get(interaction.commandName);
  } else {
    client.log.error(`${type} not found: ${interaction.type}`);
    return;
  }

  if (!module) {
    client.log.error(`Module not found for ${type}: ${interaction.commandName || interaction.customId}`);
    return;
  }

  const isAutocomplete =
    interaction.type === InteractionType.ApplicationCommandAutocomplete && interaction.isAutocomplete();

  try {
    if (module.admin) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        if (isAutocomplete) {
          return await interaction.respond([{ name: 'Missing Permission', value: 'denied-permission' }]);
        }
        return await interaction.reply({ content: `⚠️ Only administrators can use this command!`, flags: 64 });
      }
    }

    if (module.owner) {
      if (interaction.user.id !== BOT_OWNER_ID) {
        if (isAutocomplete) {
          return await interaction.respond([{ name: 'Missing Permission', value: 'denied-permission' }]);
        }
        return await interaction.reply({ content: `⚠️ Only bot owners can use this command!`, flags: 64 });
      }
    }

    if (module.requiredRole) {
      if (!interaction.member.roles.cache.has(module.requiredRole)) {
        if (isAutocomplete) {
          return await interaction.respond([{ name: 'Missing Permission', value: 'denied-permission' }]);
        }
        return await interaction.reply({
          content: `⚠️ You do not have the required role to use this command!`,
          flags: 64
        });
      }
    }

    if (module.requiredRoles) {
      const { all, roles } = module.requiredRoles;
      if (all === true) {
        if (!interaction.member.roles.cache.hasAll(...roles)) {
          if (isAutocomplete) {
            return await interaction.respond([{ name: 'Missing Permission', value: 'denied-permission' }]);
          }
          return await interaction.reply({
            content: `⚠️ You do not have the required roles to use this command!`,
            flags: 64
          });
        }
      } else {
        if (!interaction.member.roles.cache.hasAny(...roles)) {
          if (isAutocomplete) {
            return await interaction.respond([{ name: 'Missing Permission', value: 'denied-permission' }]);
          }
          return await interaction.reply({
            content: `⚠️ You do not have any of the required roles to use this command!`,
            flags: 64
          });
        }
      }
    }

    /**
     * @type {import('./types.d.ts').CooldownUsage}
     */
    const cooldownUsage = module.cooldown;

    if (cooldownUsage) {
      const result = await getResult(interaction, cooldownUsage);
      if (result !== true) {
        return;
      }
    }

    if (isAutocomplete) {
      if (module.autocomplete && typeof module.autocomplete === 'function') {
        /**
         * @type {string[]}
         */
        const autocompleteOptions = [];
        if (module.options && Array.isArray(module.options)) {
          module.options.forEach(option => {
            if (
              [
                Discord.ApplicationCommandOptionType.String,
                Discord.ApplicationCommandOptionType.Integer,
                Discord.ApplicationCommandOptionType.Number
              ].includes(option.type) &&
              option.autocomplete === true
            ) {
              autocompleteOptions.push(option.name);
            }
          });
        }

        await module.autocomplete(client, interaction, autocompleteOptions);
      } else {
        await interaction.respond([]);
      }
    } else if (type === 'commands') {
      await module.execute(client, interaction);
    } else {
      const [_, args] = interaction.customId.split(':');
      const argsArray = args !== undefined ? args.split('/') : [];
      await module.execute(client, interaction, argsArray);
    }
  } catch (error) {
    console.error(error);
    if (isAutocomplete) {
      try {
        await interaction.respond([]);
      } catch (respondError) {
        client.log.error('Failed to respond to autocomplete interaction:', respondError);
      }
    } else {
      const errorMessage = {
        content: `There was an error while executing this ${type === 'commands' ? 'command' : 'interaction'}!\n\`\`\`${
          error.message || error
        }\`\`\``,
        embeds: [],
        components: [],
        files: []
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (replyError) {
        client.log.error('Failed to send error message:', replyError);
      }
    }
  }

  /**
   *
   * @param {ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction | ContextMenuCommandInteraction | UserContextMenuCommandInteraction | ModalSubmitInteraction} interaction
   * @param {Omit<import('./types.d.ts').InternalCooldownConfig, 'userId' | 'actionId' | 'guildId' | 'channelId'>} usage
   * @returns
   */
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
            case ComponentType.StringSelect ||
              ComponentType.ChannelSelect ||
              ComponentType.MentionableSelect ||
              ComponentType.RoleSelect ||
              ComponentType.UserSelect:
              actionId = `menu_${interaction.customId}`;
              break;
            default:
              break;
          }
          break;

        case InteractionType.ModalSubmit:
          actionId = `modal_${interaction.customId}`;
          break;
        default:
          break;
      }
    }
    /**
     * @type {import('./types.d.ts').InternalCooldownConfig}
     */
    const cooldownUsage = {
      cooldownType: usage.cooldownType,
      duration: usage.duration,
      userId: interaction.user.id,
      actionId,
      guildId: interaction.guildId,
      channelId: interaction.channelId
    };
    const result = await cooldowns.start(cooldownUsage);
    if (typeof result === 'object') {
      await client.users.cache
        .get(Array.isArray(Owners) ? Owners[0] : Owners)
        ?.send({
          content: result.main
        })
        .catch(() => null);
      return await interaction.reply({
        content: result.reply,
        flags: 64
      });
    } else if (typeof result === 'string') {
      return await interaction.reply({
        content: result,
        flags: 64
      });
    } else return true;
  }
};
