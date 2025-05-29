const { ComponentModule, ComponentType } = require('../utils');

module.exports = ComponentModule({
  customId: 'test',
  type: ComponentType.StringSelect,
  execute: async (client, interaction, args) => {
    return await interaction.reply({
      content: 'SelectMenu interaction works.',
      flags: 64
    });
  }
});
