const { Events } = require('discord.js');
const { InteractionHandler, EventModule } = require('../utils');

module.exports = EventModule({
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    if (interaction.isCommand()) {
      await InteractionHandler(client, interaction, 'commands');
    } else if (interaction.isButton()) {
      await InteractionHandler(client, interaction, 'buttons');
    } else if (interaction.isAnySelectMenu()) {
      await InteractionHandler(client, interaction, 'menus');
    } else if (interaction.isModalSubmit()) {
      await InteractionHandler(client, interaction, 'modals');
    } else {
      console.warn(`[INTERACTION_HANDLER]: Error executing ${interaction.type} interaction.`);
    }
  }
});
