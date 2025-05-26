const { ActivityType, Events } = require('discord.js');
const { EventModule } = require('../utils');

module.exports = EventModule({
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    client.log.success(`Logged in as ${client.user.tag}!`);
    client.user.setActivity({
      name: '🌍 Extended dev toolkit',
      type: ActivityType.Custom
      //   url: 'https://www.twitch.tv/discord'
    });
  }
});
