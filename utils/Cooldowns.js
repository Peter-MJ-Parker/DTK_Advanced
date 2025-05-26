const { CooldownTypes, cooldownDurations } = require('./types.d.ts');
const { DTKExtendedClient, Owners } = require('.');
const { cooldownSchema } = require('../schemas');

module.exports = class Cooldowns {
  /**
   * @type {Map<string, Date>}
   */
  #_cooldowns = new Map();
  #_errorMessage = 'Sorry, this {FEATURE} is currently on cooldown. Will be available again {TIME}.';
  #_botOwnersBypass = true;

  /**
   * @typedef {Object} CooldownOptions
   * @property {boolean} botOwnersBypass
   * @property {string} errorMessage
   *
   * @param {DTKExtendedClient} client
   * @param {CooldownOptions} options
   */
  constructor(client, options) {
    this._client = client;
    this._options = options;
    if (this._options.errorMessage) {
      this.#_errorMessage = this._options.errorMessage;
    }
    if (this._options.botOwnersBypass !== undefined) {
      this.#_botOwnersBypass = this._options.botOwnersBypass;
    }
    this.init();
  }

  get #_logger() {
    return this._client.log;
  }

  async init() {
    try {
      await cooldownSchema.deleteMany({
        expires: { $lt: new Date() }
      });

      const results = await cooldownSchema.find({});
      for (const result of results) {
        const { _id: id, expires } = result;
        this.#_cooldowns.set(id, expires);
      }
      this.#_logger.success('[COOLDOWNS]- Successfully Loaded Cooldowns!');
    } catch (error) {
      return this.#_logger.error(`[COOLDOWNS]- Cooldowns unavailable due to: ${error.message}.`);
    }
  }

  /**
   *
   * @param {import('./types.d.ts').InternalCooldownConfig} cooldownUsage
   */
  async cancelCooldown(cooldownUsage) {
    const key = this.#getKey(cooldownUsage);

    this.#_cooldowns.delete(key);

    await cooldownSchema.deleteOne({ _id: key });
  }

  /**
   *
   * @param {number | [number, 's' | 'm' | 'd' | 'h']} duration
   * @returns {number}
   */
  verifyCooldown(duration) {
    if (typeof duration === 'number') {
      return duration;
    }
    if (Array.isArray(duration)) {
      if (duration.length < 1 || duration.length > 2) {
        throw new Error(`Duration "${duration}" is an invalid duration. Please use "[10, "s"]", "[15, "m]" etc.`);
      }
      const [amount, unit] = duration;
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error('amount must be a whole number greater than 0.');
      }
      if (!cooldownDurations[unit]) {
        throw new Error(
          `Unknown duration type "${unit}". Please use one of the following: ${Object.keys(cooldownDurations)}`
        );
      }
      return amount * cooldownDurations[unit];
    }
    throw new Error('Invalid cooldown duration provided.');
  }

  /**
   *
   * @param {import('./types.d.ts').InternalCooldownConfig} cooldownUsage
   * @returns {string}
   */
  #getKey(cooldownUsage) {
    const { cooldownType, userId, actionId, guildId = '', channelId } = cooldownUsage;

    const isPerUser = cooldownType === CooldownTypes.PerUser;
    const isPerUserPerGuild = cooldownType === CooldownTypes.PerUserPerGuild;
    const isPerGuild = cooldownType === CooldownTypes.PerGuild;
    const isGlobal = cooldownType === CooldownTypes.Global;
    const isPerChannel = cooldownType === CooldownTypes.PerChannel;
    const isPerUserPerChannel = cooldownType === CooldownTypes.PerUserPerChannel;

    if ((isPerUserPerGuild || isPerGuild) && !guildId) {
      throw new Error(`Invalid cooldown type "${cooldownType}" used outside of a guild.`);
    }

    return isGlobal
      ? actionId
      : isPerGuild
      ? `${guildId}-${actionId}`
      : isPerUser
      ? `${userId}-${actionId}`
      : isPerUserPerGuild
      ? `${userId}-${guildId}-${actionId}`
      : isPerChannel
      ? `${channelId}-${actionId}`
      : isPerUserPerChannel
      ? `${userId}-${channelId}-${actionId}`
      : 'ERROR';
  }

  /**
   *
   * @param {import('./types.d.ts').InternalCooldownConfig} cooldownUsage
   */
  async start(cooldownUsage) {
    const { duration, userId } = cooldownUsage;
    if (this.#_botOwnersBypass === true && (Array.isArray(Owners) ? Owners.includes(userId) : Owners === userId)) {
      return true;
    } else {
      try {
        const seconds = this.verifyCooldown(duration);
        const key = this.#getKey(cooldownUsage);
        const _exists = this.#_cooldowns.get(key);

        if (!_exists) {
          const expires = new Date();
          expires.setSeconds(expires.getSeconds() + seconds);
          this.#_cooldowns.set(key, expires);
          await cooldownSchema.create({
            id: key,
            expires,
            count: 0
          });
          return true;
        } else {
          const _remainingTime = Math.max(_exists.getTime() - Date.now(), 0);
          const newSeconds = new Date().getSeconds();
          const _newExpires = new Date(_remainingTime + seconds + newSeconds);

          if (new Date() > _exists) {
            this.#_cooldowns.delete(key);
            await cooldownSchema.deleteOne({
              _id: key
            });
            return true;
          }

          const current = await cooldownSchema.findById(key);
          if (current && current.count === 0) {
            await current.updateOne({
              $inc: { count: 1 }
            });
            return this.#_errorMessage
              .replace('{TIME}', `<t:${Math.floor(_exists.getTime() / 1000)}:R>`)
              .replace('{FEATURE}', cooldownUsage.actionId.split('_')[0]);
          } else if (current && current.count === 1) {
            _newExpires.setSeconds(_newExpires.getSeconds() + seconds + _remainingTime);

            this.#_cooldowns.set(key, _newExpires);
            await current.updateOne({
              $inc: { count: 1 }
            });

            return 'Try that again before your cooldown expires and your cooldown time will be increased!';
          } else if (current?.count && current.count > 1) {
            await current.updateOne({
              $inc: { count: 1 },
              expires: _newExpires
            });
            return `Congrats on your inability to obey cooldown times! Your new time is: <t:${Math.floor(
              _newExpires.getTime() / 1000
            )}:R>`;
          }
          return false;
        }
      } catch (error) {
        const errMessage = '[COOLDOWNS]- Error occured in cooldowns! ' + error;
        console.error(errMessage);
        const reply = 'There was an error implementing cooldowns! This error has been sent to the Developer!';
        const main = `\`\`\`\n${errMessage}\n\`\`\``;
        return {
          reply,
          main
        };
      }
    }
  }
};
