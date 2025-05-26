const { ComponentModule, ComponentType } = require('../utils');

module.exports = ComponentModule({
  customID: 'say',
  type: ComponentType.Modal,
  async execute(client, interaction) {
    const message = interaction.fields.getTextInputValue('message');
    await interaction.deferReply({ ephemeral: true });

    try {
      await interaction.channel.send(message);
      await interaction.deleteReply();
    } catch (error) {
      await interaction.editReply('Failed to send message - Check I have permission to send messages in this channel!');
    }
  }
});
