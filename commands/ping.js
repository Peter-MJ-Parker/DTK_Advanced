const { CommandModule, CommandType } = require('../utils');

module.exports = CommandModule({
  name: 'ping',
  description: 'Pong!',
  type: CommandType.Slash,
  async execute(client, interaction) {
    interaction.reply('Pong!');
  }
});
