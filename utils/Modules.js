const Discord = require('discord.js');
const { CommandType, ComponentType, CooldownTypes } = require('./types.d.ts');

/**
 * @template {keyof Discord.ClientEvents} K
 * @param {import('./types.d.ts').EventModule<K>} options
 * @returns
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
 * @param {import('./types.d.ts').CommandModule} mod
 * @returns
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
 * @param {import('./types.d.ts').ComponentModule} mod
 * @returns
 */
const ComponentModule = mod => {
  if (!mod.customId || typeof mod.execute !== 'function') {
    throw new Error(`ComponentModule: ${mod.customId} requires customId, type, and execute function.`);
  }

  return {
    customId: mod.customId,
    cooldown: mod.cooldown,
    type: mod.type,
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
