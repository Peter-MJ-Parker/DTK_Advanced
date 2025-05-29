const { BOT_OWNER_ID } = process.env;
const CheckIntents = require('./CheckIntents.js');
const ComponentLoader = require('./ComponentLoader.js');
const EventLoader = require('./EventLoader.js');
const DTKExtendedClient = require('./Client.js');
const Logging = require('./Logger.js');
const MongoConnect = require('./MongoConnect.js');
const ReadFolder = require('./ReadFolder.js');
const RegisterCommands = require('./RegisterCommands.js');
const Cooldowns = require('./Cooldowns.js');

/**
 *
 * @param {boolean | undefined} enabled
 * @returns {Logging}
 */
const Logger = enabled => new Logger({ enabled });

const {
  CommandModule,
  ComponentModule,
  ComponentType,
  EventModule,
  CommandType,
  containsUserId
} = require('./Modules.js');
const { TextInputBuilder, ActionRowBuilder } = require('discord.js');

const Owners = BOT_OWNER_ID.includes(',') ? BOT_OWNER_ID.split(',') : BOT_OWNER_ID;
/**
 *
 * @param {string} userId
 * @returns {boolean}
 */
const isOwner = userId => (Array.isArray(Owners) ? Owners.includes(userId) : userId === Owners);

/**
 * @param {string} string
 * @returns {string}
 */
const capitalise = string => {
  return string
    .split(' ')
    .map(str => str.slice(0, 1).toUpperCase() + str.slice(1))
    .join(' ');
};

/**
 * @param {string} id
 * @param {string} title
 * @param {TextInputBuilder[]} components
 */
const createModal = (id, title, components) => {
  /**
   * @type {ActionRowBuilder<TextInputBuilder>[]}
   */
  const rows = components.map(field => {
    /**
     * @type {ActionRowBuilder<TextInputBuilder>}
     */
    const each = new ActionRowBuilder({
      components: [field]
    });
    return each;
  });
  return new ModalBuilder({
    custom_id: id.toString(),
    title: capitalise(title).toString(),
    components: rows
  });
};

module.exports = {
  capitalise,
  CheckIntents,
  CommandModule,
  CommandType,
  ComponentModule,
  ComponentType,
  ComponentLoader,
  containsUserId,
  Cooldowns,
  createModal,
  EventLoader,
  EventModule,
  DTKExtendedClient,
  isOwner,
  Logger,
  Logger,
  MongoConnect,
  Owners,
  ReadFolder,
  RegisterCommands
};
