const { EventModule } = require('../utils');
const { Events } = require('discord.js');

module.exports = EventModule({
  name: Events.GuildDelete,
  async execute(client, guild) {
    console.log(`Left guild ${guild.name} with ${guild.memberCount} members!`);
  }
});
