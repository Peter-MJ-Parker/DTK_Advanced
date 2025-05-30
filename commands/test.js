const { CommandModule, CommandType, CooldownTypes } = require('../utils');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = CommandModule({
  /**
   * REQUIRED PROPERTY TO GET CORRECT TYPES IN EXECUTE
   * Inserting type first in the command object will display correct requirements
   */
  type: CommandType.Slash,

  /**
   * NAME IS ALWAYS REQUIRED
   */
  name: 'test',

  /**
   * Description is only required in Slash and Text Commands!
   */
  description: 'See how this powerful handler functions!',

  /**
   * OPTIONAL PROPERTIES WILL RETURN FALSE IF NOT INPUTTED
   */
  dm_permission: false,
  admin: true,
  dev: false,
  owner: false,
  requiredRoles: {
    all: true, //default: false
    roles: [] //required if inputted
  }, //false
  deniedRoles: [], //false

  /**
   * OPTIONS FOR ADDING STRING OPTIONS, SUBCOMMANDS, ETC
   */
  options: [
    {
      name: 'action',
      description: 'What would you like to see?',
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
      required: true,
      /**
       * execute is only available for options with autocomplete set to true
       */
      execute: async (client, interaction) => {
        //respond to the autocomplete interaction
        await interaction.respond([
          { name: 'buttons', value: 'buttons' },
          { name: 'modal', value: 'modal' },
          { name: 'menu', value: 'menu' }
        ]);
      }
    }
  ],

  /**
   * Apply a custom cooldown to the command! Works with all interactions/command types.
   * @example ```js
   * {
   *  cooldownType: CooldownType.PerUser,
   *  duration: number || array
   * }
   * ```
   */
  cooldown: {
    cooldownType: CooldownTypes.Global, //Always supply a type or it will be invalid!
    duration: [3, 'h'] //Example: 3 hours... Can use a number in milliseconds or an array to specify the amount and length.
  },

  /**
   * EXECUTE FUNCTION IS ALWAYS REQUIRED
   */
  execute: async (client, interaction) => {
    return await interaction.reply({ content: 'Test slash command works', flags: 64 });
  }
});
