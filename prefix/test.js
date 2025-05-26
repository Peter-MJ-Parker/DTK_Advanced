const { CommandModule, CommandType } = require('../utils');
const { CooldownTypes } = require('../utils/types');

module.exports = CommandModule({
  name: 'test', //required
  description: 'Send test command', //required
  type: CommandType.Text,
  admin: true, //false
  aliases: [], //provide the extra names
  dev: true, //false
  owner: true, //false
  requiredRoles: {
    all: true, //false (defaults to false)
    roles: [] //id of the roles you would like to allow access
  }, //false
  deniedRoles: [],
  cooldown: {
    cooldownType: CooldownTypes.Global,
    duration: [24, 'h']
  },
  execute: async (client, message) => {
    //run code
    return await message.reply('Test command works!');
  }
});
