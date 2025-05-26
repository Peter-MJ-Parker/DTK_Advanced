const { CommandModule, CommandType } = require('../utils');

module.exports = CommandModule({
  type: CommandType.CtxMsg,
  name: 'test-ctx-msg',
  execute: async (client, interaction) => {
    await interaction.reply({
      content: 'This is a test context message command!',
      ephemeral: true
    });
  }
});
