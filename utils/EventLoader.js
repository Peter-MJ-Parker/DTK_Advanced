const fs = require('node:fs');
const { Events } = require('discord.js');
const ReadFolder = require('./ReadFolder.js');
const { ExtendedClient } = require('.');

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = function (client) {
  if (!fs.existsSync(`${__dirname}/../events/`)) return;

  const files = ReadFolder('events');
  for (const { path, data } of files) {
    if (typeof data.name !== 'string') {
      client.log.error(`Could not load ${path} : Missing name`);
      continue;
    }

    if (Events[data.name]) data.name = Events[data.name];

    if (!Events[data.name] && !Object.values(Events).includes(data.name)) {
      client.log.error(`Invalid event name "${data.name}" - Unknown to Discord.JS`);
    }

    if (typeof data.execute !== 'function') {
      client.log.error(`Could not load ${path} : Missing an execute function`);
      continue;
    }

    client[data.once ? 'once' : 'on'](data.name, (...args) => data.execute(client, ...args));
  }

  client.log.success(`Loaded ${files.length} events!`);
};
