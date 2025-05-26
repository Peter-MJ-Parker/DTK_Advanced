import type { Document, ConnectOptions } from 'mongoose';
import {
  APIApplicationCommandBasicOption,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  BaseApplicationCommandOptionsData,
  Client,
  ClientEvents,
  GatewayIntentBits
} from 'discord.js';
import Logger from './Logger';
import Cooldowns from './Cooldowns';

/******************TYPES********************/
export interface InternalCooldownConfig {
  cooldownType: CooldownTypes;
  duration: number | [number, 's' | 'm' | 'd' | 'h'];
  userId: string;
  actionId: string;
  guildId?: string;
  channelId?: string;
}

export enum CooldownTypes {
  PerUser = 'perUser',
  PerUserPerGuild = 'perUserPerGuild',
  PerGuild = 'perGuild',
  Global = 'global',
  PerChannel = 'perChannel',
  PerUserPerChannel = 'perUserPerChannel'
}

export const cooldownDurations = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24
};

export type CooldownUsage = Omit<InternalCooldownConfig, 'userId' | 'actionId' | 'guildId' | 'channelId'>;
/*******************************************/

export interface ICooldown extends Document {
  _id: string;
  count?: number;
  expires: Date;
}

/**
 * These ideas were inspired by sern-handler (Not inteneded to plagerize)
 * @see @link {https://github.com/sern-handler/handler/blob/main/src/types/core-modules.ts}
 */
export interface DTKAutocompleteData extends Omit<BaseApplicationCommandOptionsData, 'autocomplete'> {
  autocomplete: true;
  type:
    | ApplicationCommandOptionType.String
    | ApplicationCommandOptionType.Number
    | ApplicationCommandOptionType.Integer;
  execute: (client: import('.').DTKExtendedClient, interaction: AutocompleteInteraction) => PromiseLike<unknown>;
}

export type DTKOptionsData =
  | DTKSubCommandData
  | DTKSubCommandGroupData
  | APIApplicationCommandBasicOption
  | DTKAutocompleteData;

export interface DTKSubCommandData extends APIApplicationCommandOptionBase<ApplicationCommandOptionType.Subcommand> {
  type: ApplicationCommandOptionType.Subcommand;
  options?: DTKOptionsData[];
}

export interface DTKSubCommandGroupData extends BaseApplicationCommandOptionsData {
  type: ApplicationCommandOptionType.SubcommandGroup;
  options?: DTKSubCommandData[];
}

/**
 * This interface is used to define the options for the DTKClient.
 * It includes properties for MongoDB connection options, intents, partials, logging, cooldowns, and browser status.
 * @interface DTKClientOptions
 * @property {ConnectOptions} mongoOptions - Options for connecting to the MongoDB database.
 * @property {Array<keyof typeof GatewayIntentBits>} intents - List of intents required by the bot.
 * @property {Array<keyof typeof GatewayIntentBits>} myIntents - Additional intents to include for the bot.
 * @property {boolean} [partials] - Whether to enable partial structures for certain Discord objects.
 * @property {boolean} [enableLogging] - Whether to enable logging for the bot.
 * @property {DTKCooldownConfig} [cooldowns] - Configuration for command/component cooldowns.
 * @property {boolean} [browser] - Whether to display the bot's status as Mobile (iOS) or Web.
 */
export interface DTKClientOptions {
  mongoOptions: ConnectOptions; //Options for connecting to the MongoDB database.
  intents: Array<keyof typeof GatewayIntentBits>; // List of intents required by the bot.
  myIntents: Array<keyof typeof GatewayIntentBits>; // Additional intents to include for the bot.
  partials?: boolean; // Whether to enable partial structures for certain Discord objects.
  enableLogging?: boolean; // Whether to enable logging for the bot.
  cooldowns?: DTKCooldownConfig; // Configuration for command/component cooldowns.
  browser?: boolean; // Whether to display the bot's status as Mobile (iOS) or Web.
}

/**
 * This interface defines the configuration for command and component cooldowns in the DTK framework.
 * It includes options for enabling cooldowns, allowing bot owners to bypass them, and customizing error messages.
 * @interface DTKCooldownConfig
 * @property {boolean} enabled - Whether cooldowns are enabled.
 * @property {boolean} [botOwnersBypass] - Whether bot owners can bypass cooldowns.
 * @property {string} [errorMessage] - Custom error message to display when a cooldown is active.
 */
export interface DTKCooldownConfig {
  enabled: boolean; // Whether cooldowns are enabled.
  botOwnersBypass?: boolean; // Whether bot owners can bypass cooldowns.
  errorMessage?: string; // Custom error message to display when a cooldown is active.
}
/**
 * This interface extends the Discord.js Client class to include additional properties and methods specific to the DTK framework.
 * It includes properties for the bot's owner, client ID, and a method to get the bot's owner.
 * @interface DTKExtendedClient
 * @extends {Client}
 * @property {boolean} browser - Whether to display the bot's status as Mobile (iOS) or Web.
 * @property {boolean} isCooldownEnabled - Whether cooldowns are enabled.
 * @property {Map} texts - A map of text resources used by the bot.
 * @property {Map} aliases - A map of command aliases.
 * @property {Map} commands - A map of commands registered with the bot.
 * @property {Cooldowns} [cooldowns] - An instance of the Cooldowns class, if cooldowns are enabled.
 * @property {Map} cache - A map for caching various data.
 * @property {Map} buttons - A map of button interactions.
 * @property {Map} modals - A map of modal interactions.
 * @property {Map} menus - A map of menu interactions.
 * @property {Map} events - A map of event handlers.
 * @property {Logger} log - An instance of the Logger class for logging messages.
 */
export interface DTKExtendedClient extends Client {
  browser: boolean;
  isCooldownEnabled: boolean;
  texts: Map;
  aliases: Map;
  commands: Map;
  cooldowns?: Cooldowns;
  cache: Map;
  buttons: Map;
  modals: Map;
  menus: Map;
  events: Map;
  log: Logger;
}
