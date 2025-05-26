const { Cooldowns, RegisterCommands, EventLoader, ComponentLoader, Logger, CheckIntents, MongoConnect } = require('.');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { MONGO_DB_URL } = process.env;
const {
  DefaultWebSocketManagerOptions: { identifyProperties }
} = require('@discordjs/ws');

module.exports = class DTKExtendedClient extends Client {
  #browser = false;
  #isCooldownEnabled = false;
  texts = new Map();
  aliases = new Map();
  commands = new Map();
  /**
   * @type {Cooldowns | undefined}
   */
  cooldowns = undefined;
  cache = new Map();
  buttons = new Map();
  modals = new Map();
  menus = new Map();
  events = new Map();
  log = Logger(this._options.enableLogging);
  /**
   * @param {import('./types').DTKClientOptions} options - Options for the DTKExtendedClient.
   */
  constructor(options) {
    this._options = options;
    this.#isCooldownEnabled = options.cooldowns?.enabled;
    this.#browser = options.browser ? 'Discord iOS' : 'Discord Web';
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
      (identifyProperties.browser = this.#browser),
      ComponentLoader(this),
      RegisterCommands(this),
      EventLoader(this),
      this.#_dbConnect()
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
