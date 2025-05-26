const { ReadFolder, DTKExtendedClient } = require('.');
const { existsSync } = require('node:fs');

const modules = ['commands', 'buttons', 'menus', 'modals', 'prefix'];

/**
 *
 * @param {DTKExtendedClient} client
 */
module.exports = function (client) {
  for (const module of modules) {
    if (!existsSync(`${__dirname}/../${module}`)) continue;

    const files = ReadFolder(module);
    for (const { path, data } of files) {
      try {
        if (!data.execute) throw `No execute function found`;
        if (typeof data.execute !== 'function') throw `Execute is not a function`;

        if (module === 'commands') {
          if (!data.name) throw 'No command name has been set';
          if (typeof data.name !== 'string') throw 'Invalid command name - Must be string';
          client.commands.set(data.name, data);
        } else if (module === 'prefix') {
          if (!data.name) throw 'No command name has been set';
          if (typeof data.name !== 'string') throw 'Invalid command name - Must be string';
          client.texts.set(data.name, data);
          if (data.aliases) {
            if (!Array.isArray(data.aliases)) throw 'Aliases must be an array';
            for (const alias of data.aliases) {
              if (typeof alias !== 'string' || alias.length < 1)
                throw 'Invalid alias - Must be string and more than zero in length';
              client.aliases.set(alias, data);
            }
          }
        } else {
          if (!data.customID) throw 'No custom ID has been set';
          if (typeof data.customID !== 'string') throw 'Invalid custom ID - Must be string';
          let baseID = data.customID.split(':')[0] ?? data.customID;
          client[module].set(baseID, data);
        }
      } catch (error) {
        client.log.error(`[${module.toUpperCase()}] Failed to load ./${path}: ${error.stack || error}`);
      }
    }
    client.log.success(`Loaded ${client[module].size} ${module}`);
  }
};
