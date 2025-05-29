const { Cooldowns, RegisterCommands, EventLoader, ComponentLoader, Logger, CheckIntents, MongoConnect } = require('.');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { MONGO_DB_URL } = process.env;
const {
  DefaultWebSocketManagerOptions: { identifyProperties }
} = require('@discordjs/ws');

/**
 * @typedef {import('./types').TextCommandModule} TextCommandModule
 * @typedef {import('./types').SlashCommandModule} SlashCommandModule
 * @typedef {import('./types').UserContextMenuCommandModule} UserContextMenuCommandModule
 * @typedef {import('./types').MessageContextMenuCommandModule} MessageContextMenuCommandModule
 * @typedef {import('./types').ButtonModule} ButtonModule
 * @typedef {import('./types').ModalModule} ModalModule
 * @typedef {import('./types').Menu} Menu
 * @typedef {import('./types').EventModule} EventModule
 * @typedef {import('./types').DTKClientOptions} DTKClientOptions
 * @typedef {import('./Logger')} Logger
 */
module.exports = class DTKExtendedClient extends Client {
  #browser = false;
  #isCooldownEnabled = false;

  /**
   * @param {DTKClientOptions} options - Options for the DTKExtendedClient.
   */
  constructor(options) {
    this._options = options;
    this.#isCooldownEnabled = options.cooldowns?.enabled;
    this.#browser = options.appearMobile ? 'Discord iOS' : 'Discord Web';
    super({
      intents: this._options.myIntents ?? this.#_intents,
      partials: this._options.partials
        ? [
            Partials.User,
            Partials.Message,
            Partials.Reaction,
            Partials.GuildMember,
            Partials.Channel,
            Partials.GuildScheduledEvent
          ]
        : []
    });

    if (!MONGO_DB_URL && this.#isCooldownEnabled) {
      throw new Error('MONGO_DB_URL is not set! Please set it in your .env file to use cooldowns.');
    }
    /** @type {Map<string, TextCommandModule>}*/
    this.aliases = new Map();
    /** @type {Map<string, TextCommandModule>}*/
    this.texts = new Map();
    /** @type {Map<string, SlashCommandModule>}*/
    this.commands = new Map();
    /** @type {Map<string, UserContextMenuCommandModule>}*/
    this.userContextCommands = new Map();
    /** @type {Map<string, MessageContextMenuCommandModule>}*/
    this.messageContextCommands = new Map();
    /** @type {Map<string, ButtonModule>}*/
    this.buttons = new Map();
    /** @type {Map<string, ModalModule>}*/
    this.modals = new Map();
    /** @type {Map<string, Menu>}*/
    this.menus = new Map();
    /** @type {Map<string, EventModule>}*/
    this.events = new Map();
    /** @type {Cooldowns | undefined}*/
    this.cooldowns = undefined;
    /** @type {Logger} */
    this.log = Logger(this._options.enableLogging);
    this.#_init();
  }

  #_intents = [
    ...new Set(
      [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent
      ],
      ...this._options.intents.map(intent => GatewayIntentBits[intent])
    )
  ].filter((intent, index, self) => self.indexOf(intent) === index);

  #_init = async () => {
    await Promise.all(
      CheckIntents(this),
      this.log.info(`Logging in...`),
      this.login(),
      this.#_dbConnect(),
      (identifyProperties.browser = this.#browser),
      ComponentLoader(this),
      RegisterCommands(this),
      EventLoader(this)
    );
  };
  #_dbConnect = async () => {
    if (MONGO_DB_URL) {
      MongoConnect(this, MONGO_DB_URL, this._options.mongoOptions);
    }
    if (this.#isCooldownEnabled) {
      const { enabled, ...cooldownOptions } = this._options.cooldowns;
      this.cooldowns = new Cooldowns(this, cooldownOptions);
    }
  };
};
