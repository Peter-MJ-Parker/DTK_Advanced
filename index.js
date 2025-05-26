require('dotenv').config();
const { DTKExtendedClient } = require('./utils');

//FILL IN OPTIONS!
//If there is an empty object or array, use `CTRL + SPACE` to activate intellisense!
//Already have the following intents enabled: Guilds, GuildMembers, GuildMessages, GuildMessageReactions, GuildPresences, MessageContent
const client = new DTKExtendedClient({
  mongoOptions: {}, //MongoDB options, e.g. { useNewUrlParser: true, useUnifiedTopology: true }
  partials: true, //false
  intents: [], //Adding intents here will add to the already existing intents! Adding one that is already included, will be ignored.
  // myIntents: [], //This will overwrite default intents! Please don't mix `intents` and `myIntents`!
  enableLogging: true, //false
  cooldowns: {
    enabled: true, //false
    botOwnersBypass: true, //false
    /**
     * THIS IS OPTIONAL! Already have a default response for cooldowns!
     * module type ({FEATURE}): command, button, select menu, modal, prefix command
     * If you want to use a custom error message, please use the following format:
     * {FEATURE} - the type of module that is on cooldown
     * {TIME} - the time remaining for the cooldown
     * Example: 'This {FEATURE} is on cooldown for {TIME}'
     */
    errorMessage: '{FEATURE} is on cooldown for {TIME}'
  },
  browser: true //true - Mobile; false - Web
});

module.exports = client;
