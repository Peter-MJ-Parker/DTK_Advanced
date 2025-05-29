const { ComponentModule, ComponentType } = require('../utils');

module.exports = ComponentModule({
  customId: 'test',
  type: ComponentType.Button,
  async execute(client, interaction, args) {
    return await interaction.reply({
      content: 'Button interaction works.',
      flags: 64
    });
  }
});
