const { CommandModule, CommandType } = require('../utils');

module.exports = CommandModule({
  type: CommandType.CtxUser,
  name: 'test-ctx-user',
  execute: async (client, interaction) => {
    await interaction.reply({
      content: 'This is a test context user command!',
      flags: 64
    });
  }
});
