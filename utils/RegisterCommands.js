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

  for (const [_, command] of client.commands) {
    const commandData = command;
    commandData.dm_permission ??= false;
    try {
      if (!commandData) throw `No command.data found - Did you forget to save the file?`;
      if (commandNames.includes(commandData?.name)) continue;
      commandNames.push(commandData.name);
      if (command.dev) {
        devCommands.push(commandData);
      } else {
        commands.push(commandData);
      }
    } catch (error) {
      client.log.error(`Failed to register ${commandData.name}: `, error);
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
