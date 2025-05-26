const { model, Schema } = require('mongoose');
const reqString = { type: String, required: true };
const reqNumber = { type: Number, required: true };
const reqDate = { type: Date, required: true };

const cooldownSchema = model(
  'Cooldowns',
  new Schema({
    _id: reqString,
    count: reqNumber,
    expires: reqDate
  }),
  'Cooldowns'
);

const ticketSetupSchema = model(
  'TicketSetup',
  new Schema({
    guildId: {
      type: String,
      required: true
    },
    categories: {
      type: [{ name: reqString, id: reqString }],
      required: true
    },
    panel: {
      required: true,
      type: {
        channelId: reqString,
        messageId: reqString
      }
    },
    tickets: {}
  }),
  'TicketSetup'
);

const ticketsSchema = model('Tickets', new Schema({}), 'Tickets');

module.exports = { cooldownSchema, ticketSetupSchema, ticketsSchema };
