const Discord = require('discord.js');
const { DTKExtendedClient } = require('.');

/**
 * @template {keyof Discord.ClientEvents} K
 * @typedef {Object} EventModuleOptions
 * @property {K} name - The name of the event
 * @property {boolean} [once] - Whether to run only once
 * @property {(client: DTKExtendedClient, ...args: Discord.ClientEvents[K]) => import('discord.js').Awaitable<unknown>} execute
 */

/**
 * Creates an event module with proper typing for Discord.js events
 * @template {keyof Discord.ClientEvents} K
 * @param {EventModuleOptions<K>} options - The event module options
 * @returns {EventModuleOptions<K>} The validated event module
 */
const EventModule = options => {
  if (!options.name || typeof options.execute !== 'function') {
    throw new Error('EventModule requires a name and an execute function.');
  }

  return {
    name: options.name,
    once: !!options.once,
    execute: options.execute
  };
};

/**
 * Enum-like object for CommandType
 * @readonly
 * @enum {string} CommandType
 * @property {string} Slash - Represents a slash command (application command)
 * @property {string} Text - Represents a text command
 * @property {string} CtxMsg - Represents a context message menu command
 * @property {string} CtxUser - Represents a context user menu command
 */
const CommandType = Object.freeze({
  Slash: 'Slash',
  Text: 'Text',
  CtxMsg: 'ContextMessage',
  CtxUser: 'ContextUser'
});

/**
 * @typedef {Object} SlashCommandModuleOptions
 * @property {string} name
 * @property {string} description
 * @property {typeof CommandType.Slash} type
 * @property {import('./types.d.ts').DTKOptionsData[]} options
 * @property {boolean | undefined} dm_permission
 * @property {boolean | undefined} admin
 * @property {boolean | undefined} dev
 * @property {boolean | undefined} owner
 * @property {{ all?: boolean; roles: string[] } | false | undefined} requiredRoles
 * @property {string[] | false | undefined} deniedRoles
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.ChatInputCommandInteraction) => import('discord.js').Awaitable<unknown>} execute
 */

/**
 * @typedef {Object} TextCommandModuleOptions
 * @property {string} name
 * @property {string} description
 * @property {typeof CommandType.Text} type
 * @property {string[]} aliases
 * @property {boolean | undefined} admin
 * @property {boolean | undefined} dev
 * @property {boolean | undefined} owner
 * @property {{ all?: boolean; roles: string[] } | false | undefined} requiredRoles
 * @property {string[] | false | undefined} deniedRoles
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, message: Discord.Message<boolean>) => Awaitable<unknown>} execute
 */

/**
 * @typedef {Object} UserContextMenuCommandModuleOptions
 * @property {string} name
 * @property {typeof CommandType.CtxUser} type
 * @property {boolean | undefined} dm_permission
 * @property {boolean | undefined} admin
 * @property {boolean | undefined} dev
 * @property {boolean | undefined} owner
 * @property {{ all?: boolean; roles: string[] } | false | undefined} requiredRoles
 * @property {string[] | false | undefined} deniedRoles
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.UserContextMenuCommandInteraction, args: string[]) => Awaitable<unknown>} execute
 */

/**
 * @typedef {Object} MessageContextMenuCommandModuleOptions
 * @property {string} name
 * @property {typeof CommandType.CtxMsg} type
 * @property {boolean | undefined} dm_permission
 * @property {boolean | undefined} admin
 * @property {boolean | undefined} dev
 * @property {boolean | undefined} owner
 * @property {{ all?: boolean; roles: string[] } | false | undefined} requiredRoles
 * @property {string[] | false | undefined} deniedRoles
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.MessageContextMenuCommandInteraction, args: string[]) => Awaitable<unknown>} execute
 */

/**
 * @typedef {SlashCommandModuleOptions | TextCommandModuleOptions | UserContextMenuCommandModuleOptions | MessageContextMenuCommandModuleOptions} CommandModuleOptions
 */

/**
 * @param {CommandModuleOptions} mod
 * @returns {CommandModuleOptions}
 */
const CommandModule = mod => {
  if (!mod.name || typeof mod.execute !== 'function') {
    throw new Error('CommandModule requires a name and an execute function.');
  }

  if (mod.type === CommandType.Slash || mod.type === CommandType.Text) {
    if (!mod.description) {
      throw new Error(`CommandModule: ${mod.name} of type ${mod.type} requires a description.`);
    }
  }

  if (mod.requiredRoles && mod.requiredRoles !== false && !mod.requiredRoles.roles) {
    throw new Error(
      `CommandModule: ${mod.name} has requiredRoles set but no roles are present! Please set them! Example of \`requiredRoles\`: { all: true, roles: ['123', '1234'] }`
    );
  }

  const baseModule = {
    name: mod.name,
    type: mod.type,
    dev: !!mod.dev,
    admin: !!mod.admin,
    owner: !!mod.owner,
    requiredRoles: !!mod.requiredRoles,
    deniedRoles: !!mod.deniedRoles,
    cooldown: mod.cooldown ?? undefined,
    execute: mod.execute
  };

  if (mod.type === CommandType.Slash) {
    return {
      ...baseModule,
      description: mod.description ?? '',
      dm_permission: !!mod.dm_permission,
      options: mod.options ?? undefined
    };
  }

  if (mod.type === CommandType.Text) {
    return {
      ...baseModule,
      description: mod.description ?? '',
      aliases: mod.aliases ?? undefined
    };
  }

  if ([CommandType.CtxUser, CommandType.CtxMsg].includes(mod.type)) {
    return {
      ...baseModule,
      dm_permission: !!mod.dm_permission
    };
  }

  return baseModule;
};

/**
 * Enum-like object for ComponentType
 * @readonly
 * @enum {string} ComponentType
 * @property {string} Button - Represents a Button
 * @property {string} Modal - Represents a Modal
 * @property {string} StringSelect - Represents a string select menu
 * @property {string} UserSelect - Represents a user select menu
 * @property {string} RoleSelect - Represents a role select menu
 * @property {string} MentionableSelect - Represents a mentionable select menu
 * @property {string} ChannelSelect - Represents a channel select menu
 */
const ComponentType = Object.freeze({
  Button: 'Button',
  Modal: 'Modal',
  StringSelect: 'StringSelect',
  UserSelect: 'UserSelect',
  RoleSelect: 'RoleSelect',
  MentionableSelect: 'MentionableSelect',
  ChannelSelect: 'ChannelSelect'
});

/**
 * @typedef {Object} ButtonModuleOptions
 * @property {string} customId
 * @property {typeof ComponentType.Button} type
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.ButtonInteraction, args: string[]) => Awaitable<unknown>} execute
 *
 * @typedef {Object} StringSelectModuleOptions
 * @property {string} customId
 * @property {typeof ComponentType.StringSelect} type
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.StringSelectMenuInteraction, args: string[]) => Awaitable<unknown>} execute
 *
 * @typedef {Object} UserSelectModuleOptions
 * @property {string} customId
 * @property {typeof ComponentType.UserSelect} type
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.UserSelectMenuInteraction, args: string[]) => Awaitable<unknown>} execute
 *
 * @typedef {Object} RoleSelectModuleOptions
 * @property {string} customId
 * @property {typeof ComponentType.RoleSelect} type
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.RoleSelectMenuInteraction, args: string[]) => Awaitable<unknown>} execute
 *
 * @typedef {Object} MentionableSelectModuleOptions
 * @property {string} customId
 * @property {typeof ComponentType.MentionableSelect} type
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.MentionableSelectMenuInteraction, args: string[]) => Awaitable<unknown>} execute
 *
 * @typedef {Object} ChannelSelectModuleOptions
 * @property {string} customId
 * @property {typeof ComponentType.ChannelSelect} type
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.ChannelSelectMenuInteraction, args: string[]) => Awaitable<unknown>} execute
 *
 * @typedef {Object} ModalModuleOptions
 * @property {string} customId
 * @property {typeof ComponentType.Modal} type
 * @property {import('./types.d.ts').CooldownUsage} [cooldown]
 * @property {(client: DTKExtendedClient, interaction: Discord.ModalSubmitInteraction, args: string[]) => Awaitable<unknown>} execute
 *
 * @typedef {ButtonModuleOptions | StringSelectModuleOptions | UserSelectModuleOptions | RoleSelectModuleOptions | MentionableSelectModuleOptions | ChannelSelectModuleOptions | ModalModuleOptions} ComponentModuleOptions
 *
 * @param {ComponentModuleOptions} mod
 * @returns {ComponentModuleOptions}
 */

/**
 *
 * @param {import('./types.d.ts').ComponentModuleOptions} mod
 * @returns
 */
const ComponentModule = mod => {
  if (!mod.customId || typeof mod.execute !== 'function' || !mod.type) {
    throw new Error(`ComponentModule: ${mod.customId} requires customId, type, and execute function.`);
  }

  return {
    customId: mod.customId,
    type: mod.type,
    cooldown: mod.cooldown ?? undefined,
    execute: mod.execute
  };
};

/**
 * Checks if any of the args in the array contain a user ID
 * @param {Discord.Interaction} interaction - The interaction object
 * @param {string[]} args - The array of arguments to check
 * @returns {boolean} True if any of the args include a valid user ID, otherwise false
 */
const containsUserId = (interaction, args) => {
  if (!interaction || !Array.isArray(args)) {
    throw new Error('Invalid parameters passed to containsUserId.');
  }

  return args.some(arg => {
    try {
      const deconstructed = Discord.SnowflakeUtil.deconstruct(arg);
      return (
        deconstructed &&
        deconstructed.timestamp > 0 &&
        (interaction.client.users.cache.has(arg) || interaction.guild?.members.cache.has(arg))
      );
    } catch {
      return false;
    }
  });
};

module.exports = {
  CommandModule,
  EventModule,
  ComponentModule,
  ComponentType,
  CommandType,
  containsUserId
};
