const { ExtendedClient } = require('.');
const mongoose = require('mongoose');
const { connect, connection } = mongoose;

/**
 * @param {ExtendedClient} client
 * @param {string} mongoUrl
 * @param {mongoose.ConnectOptions} options
 * @returns {mongoose.Connection}
 */
module.exports = function (client, mongoUrl, options = {}) {
  const HOSTS_REGEX =
    /^(?<protocol>[^/]+):\/\/(?:(?<username>[^:@]*)(?::(?<password>[^@]*))?@)?(?<hosts>(?!:)[^/?@]*)(?<rest>.*)/;
  const match = mongoUrl.match(HOSTS_REGEX);
  if (!match) {
    throw new Error(`Invalid connection string "${mongoUrl}"`);
  }
  const dbOptions = {
    autoIndex: true,
    socketTimeoutMS: 10000,
    family: 4,
    ...options
  };

  connection.on('connecting', () => {
    client.log.info('Mongoose is connecting...');
  });

  connect(mongoUrl, dbOptions);
  Promise = Promise;

  connection.on('connected', () => {
    client.log.success('Mongoose has successfully connected!');
  });

  connection.on('err', err => {
    client.log.error(`Mongoose connection error: \n`, err);
  });

  connection.on('disconnected', () => {
    client.log.warn('Mongoose connection lost');
  });
  return connection;
};
