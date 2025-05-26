const { ComponentModule, ComponentType } = require('../utils');

module.exports = ComponentModule({
  customId: 'test',
  type: ComponentType.Modal,
  execute: async (client, interaction, args) => {
    client.log.info(args);
    /**
     * @type {['from_button' | 'from_command']}
     */
    const [i] = args;
    switch (i) {
      case 'from_button':
        break;
      case 'from_command':
        break;
    }
  }
});
