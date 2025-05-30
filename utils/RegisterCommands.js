const { DTKExtendedClient } = require('.');
const { REST, Routes } = require('discord.js');
const { APP_ID, DEV_GUILD_ID, DISCORD_TOKEN } = process.env;

/**
 *
 * @param {DTKExtendedClient} client
 */
module.exports = client => {
  console.log('Started refreshing application (/) commands.');

  const commands = [];
  const devCommands = [];
  const commandNames = [];
  const commandMap = new Map();

  for (const [name, command] of client.commands) {
    commandMap.set(name, command);
  }

  for (const [name, command] of client.userContextCommands) {
    commandMap.set(name, command);
  }

  for (const [name, command] of client.messageContextCommands) {
    commandMap.set(name, command);
  }

  for (const [_, command] of commandMap) {
    command.dm_permission ??= false;
    try {
      if (!command) throw `No command data found - Did you forget to save the file?`;
      if (commandNames.includes(command?.name)) continue;
      commandNames.push(command.name);
      if (command.dev) {
        devCommands.push(command);
      } else {
        commands.push(command);
      }
    } catch (error) {
      client.log.error(`Failed to register ${command.name}: `, error);
    }
  }

  if (devCommands.length > 0 && !DEV_GUILD_ID) {
    client.log.warn(`You have dev commands but no DEV_GUILD_ID in \`.env\` - These will not be registered!`);
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  try {
    rest.put(Routes.applicationCommands(APP_ID), { body: commands });

    if (typeof DEV_GUILD_ID === 'string') {
      rest.put(Routes.applicationGuildCommands(APP_ID, DEV_GUILD_ID), {
        body: devCommands
      });
    }

    client.log.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    client.log.error(error);
  }
};
