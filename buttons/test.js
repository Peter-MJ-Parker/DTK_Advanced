const { ComponentModule, ComponentType } = require('../utils');
const { MessageFlags, ActionRowBuilder, ModalBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = ComponentModule({
  customId: 'test',
  type: ComponentType.Button,
  async execute(client, interaction, args) {
    client.log.info(args);
    /**
     * @type {['from_button' | 'from_command', 'menu' | 'modal', `${number}`]}
     */
    const [i, label, userId] = args;

    if (interaction.user.id !== userId) {
      return await interaction.reply({
        content: 'This button is not for you!',
        flags: MessageFlags.Ephemeral
      });
    }

    switch (label) {
      case 'menu':
        const menu = [
          new ActionRowBuilder({
            components: [
              new StringSelectMenuBuilder({
                custom_id: `test:from_button/${userId}`,
                max_values: 1,
                min_values: 1,
                placeholder: 'What would you like to see in action next?',
                options: ['role_menu', 'channel_menu', 'user_menu', 'modal'].map(choice => {
                  const name = choice.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                  return {
                    label: name,
                    value: choice,
                    description: `Show a ${name}!`
                  };
                })
              })
            ]
          })
        ];
        await interaction.update({ components: menu });
        break;
      case 'modal':
        const modal = new ModalBuilder({
          custom_id: `test:from_button`,
          title: 'This is a test modal!',
          components: []
        });
        await interaction.showModal(modal);
        break;
      default:
        break;
    }
  }
});
