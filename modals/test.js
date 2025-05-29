const { ComponentModule, ComponentType } = require('../utils');

module.exports = ComponentModule({
  customId: 'test',
  type: ComponentType.Modal,
  execute: async (client, interaction, args) => {
    return await interaction.reply({
      content: 'ModalSubmit interaction works.',
      flags: 64
    });
  }
});
