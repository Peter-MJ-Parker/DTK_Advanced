import type { Document, ConnectOptions } from 'mongoose';
import {
  APIApplicationCommandBasicOption,
  APIApplicationCommandOptionBase,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  BaseApplicationCommandOptionsData,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  ClientEvents,
  GatewayIntentBits,
  MentionableSelectMenuInteraction,
  Message,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
  UserSelectMenuInteraction
} from 'discord.js';
export type Awaitable<T> = T | PromiseLike<T>;

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
  execute: (client: import('.').DTKExtendedClient, interaction: AutocompleteInteraction) => Awaitable<unknown>;
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
 * @property {boolean} [appearMobile] - Whether to display the bot's status as Mobile (iOS) or Web.
 */
export interface DTKClientOptions {
  mongoOptions: ConnectOptions;
  intents: Array<keyof typeof GatewayIntentBits>;
  myIntents: Array<keyof typeof GatewayIntentBits>;
  partials?: boolean;
  enableLogging?: boolean;
  cooldowns?: DTKCooldownConfig;
  appearMobile?: boolean;
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
  enabled: boolean;
  botOwnersBypass?: boolean;
  errorMessage?: string;
}

export type CommandModule =
  | SlashCommandModule
  | UserContextMenuCommandModule
  | MessageContextMenuCommandModule
  | TextCommandModule;

export type Menu =
  | StringSelectModule
  | UserSelectModule
  | RoleSelectModule
  | MentionableSelectModule
  | ChannelSelectModule;

export interface EventModule<K extends keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (client: DTKExtendedClient, ...args: ClientEvents[K]) => Awaitable<unknown>;
}

export enum ComponentType {
  Button = 'Button',
  Modal = 'Modal',
  StringSelect = 'StringSelect',
  UserSelect = 'UserSelect',
  RoleSelect = 'RoleSelect',
  MentionableSelect = 'MentionableSelect',
  ChannelSelect = 'ChannelSelect'
}

export interface BaseComponentModule {
  customId: string;
  cooldown?: CooldownUsage;
}
export interface ButtonModule extends BaseComponentModule {
  type: ComponentType.Button;
  execute: (client: DTKExtendedClient, interaction: ButtonInteraction, args: string[]) => Awaitable<unknown>;
}

export interface StringSelectModule extends BaseComponentModule {
  type: ComponentType.StringSelect;
  execute: (client: DTKExtendedClient, interaction: StringSelectMenuInteraction, args: string[]) => Awaitable<unknown>;
}

export interface UserSelectModule extends BaseComponentModule {
  type: ComponentType.UserSelect;
  execute: (client: DTKExtendedClient, interaction: UserSelectMenuInteraction, args: string[]) => Awaitable<unknown>;
}

export interface RoleSelectModule extends BaseComponentModule {
  customId: string;
  type: ComponentType.RoleSelect;
  cooldown?: CooldownUsage;
  execute: (client: DTKExtendedClient, interaction: RoleSelectMenuInteraction, args: string[]) => Awaitable<unknown>;
}

export interface MentionableSelectModule extends BaseComponentModule {
  type: ComponentType.MentionableSelect;
  execute: (
    client: DTKExtendedClient,
    interaction: MentionableSelectMenuInteraction,
    args: string[]
  ) => Awaitable<unknown>;
}

export interface ChannelSelectModule extends BaseComponentModule {
  type: ComponentType.ChannelSelect;
  execute: (client: DTKExtendedClient, interaction: ChannelSelectMenuInteraction, args: string[]) => Awaitable<unknown>;
}

export interface ModalModule extends BaseComponentModule {
  type: ComponentType.Modal;
  execute: (client: DTKExtendedClient, interaction: ModalSubmitInteraction, args: string[]) => Awaitable<unknown>;
}

export type ComponentModule =
  | ButtonModule
  | ModalModule
  | StringSelectModule
  | UserSelectModule
  | RoleSelectModule
  | MentionableSelectModule
  | ChannelSelectModule;

export enum CommandType {
  Slash = 'Slash',
  Text = 'Text',
  CtxMsg = 'ContextMessage',
  CtxUser = 'ContextUser'
}

type RequiredRoles = { all?: boolean; roles: string[] } | false | undefined;
type DeniedRoles = string[] | false | undefined;

export interface BaseCommandModule {
  name: string;
  dm_permission?: boolean;
  admin?: boolean;
  dev?: boolean;
  owner?: boolean;
  requiredRoles?: RequiredRoles;
  deniedRoles?: DeniedRoles;
  cooldown?: CooldownUsage;
}
export interface SlashCommandModule extends BaseCommandModule {
  description: string;
  type: CommandType.Slash;
  options: DTKOptionsData[];
  execute: (client: DTKExtendedClient, interaction: ChatInputCommandInteraction) => Awaitable<unknown>;
}

export interface TextCommandModule extends BaseCommandModule {
  description: string;
  type: CommandType.Text;
  aliases: string[];
  execute: (client: DTKExtendedClient, interaction: Message<boolean>) => Awaitable<unknown>;
}

export interface UserContextMenuCommandModule extends BaseCommandModule {
  type: CommandType.CtxUser;
  execute: (client: DTKExtendedClient, interaction: UserContextMenuCommandInteraction) => Awaitable<unknown>;
}

export interface MessageContextMenuCommandModule extends BaseCommandModule {
  type: CommandType.CtxMsg;
  execute: (client: DTKExtendedClient, interaction: MessageContextMenuCommandInteraction) => Awaitable<unknown>;
}

export type Module = Command | ButtonModule | ModalModule | Menu;
