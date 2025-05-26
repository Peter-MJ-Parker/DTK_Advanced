const { default: chalk } = require('chalk');

/**
 * Logger utility for the ticket system
 */
module.exports = class Logger {
  /**
   * @type {boolean}
   */
  #enabled = true;
  /**
   *
   * @param {{ enabled: boolean }} options
   */
  constructor(options) {
    this.#enabled = options.enabled;
  }
  /**
   * Log an informational message
   * @param {string} message - Message to log
   * @param {any | undefined} log - Additional logging
   */
  info(message, log) {
    if (!this.#enabled) return;
    console.log(`${chalk.blue(`[INFO] - ${message}`)}`, log);
  }

  /**
   * Log a success message
   * @param {string} message - Message to log
   * @param {any | undefined} log - Additional logging
   */
  success(message, log) {
    if (!this.#enabled) return;
    console.log(`${chalk.greenBright(`[SUCCESS] - ${message}`)}`, log);
  }

  /**
   * Log a warning message
   * @param {string} message - Message to log
   * @param {any | undefined} log - Additional logging
   */
  warn(message, log) {
    if (!this.#enabled) return;
    console.log(`${chalk.yellow(`[WARN] - ${message}`)}`, log);
  }

  /**
   * Log an error message
   * @param {string} message - Message to log
   * @param {any | undefined} error - Additional logging (error)
   */
  error(message, error) {
    if (!this.#enabled) return;
    console.log(`${chalk.red(`[ERROR] - ${message}`)}`, error);
  }

  /**
   * Log a debug message
   * @param {string} message - Message to log
   * @param {any | undefined} log - Additional logging
   */
  debug(message, log) {
    if (!this.#enabled) return;
    console.log(`${chalk.bgMagenta(`[DEBUG] - ${message}`)}`, log);
  }
};
