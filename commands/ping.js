const { CommandModule } = require('../utils');

module.exports = CommandModule({
  name: 'ping',
  description: 'Pong!',
  async execute(client, interaction) {
    interaction.reply('Pong!');
  }
});
