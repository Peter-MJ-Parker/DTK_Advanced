const { EventModule } = require('../utils');
const { Events } = require('discord.js');

module.exports = EventModule({
  name: Events.GuildCreate,
  async execute(client, guild) {
    console.log(`Joined guild ${guild.name} with ${guild.memberCount} members!`);
  }
});
