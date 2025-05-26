const { ComponentModule, ComponentType } = require('../utils');

module.exports = ComponentModule({
  customId: 'test',
  type: ComponentType.StringSelect,
  execute: async (client, interaction, args) => {
    client.log.info();
    const [i] = args;
  }
});
