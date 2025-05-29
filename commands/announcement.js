const { CommandModule, CommandType } = require('../utils');
const {
  ChannelType,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ApplicationCommandOptionType
} = require('discord.js');

module.exports = CommandModule({
  name: 'announce',
  description: 'announcement command',
  type: CommandType.Slash,
  options: [
    {
      name: 'channel',
      type: ApplicationCommandOptionType.Channel,
      channel_types: ChannelType.GuildText,
      required: true
    },
    {
      name: 'send-as',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'Message',
          value: 'message'
        },
        {
          name: 'Embed',
          value: 'embed'
        },
        {
          name: 'Embed with message',
          value: 'both'
        }
      ]
    }
  ],
  async execute(client, interaction) {
    /**
     * @type {Map<string, { channelId: string, messageType: string, timeout: NodeJS.Timeout }>}
     */
    client.timedCache = new Map();
    const Channel = interaction.options.getChannel('channel');
    const Message = interaction.options.getString('send-as');
    const timeout = setTimeout(() => {
      client.timedCache.delete(interaction.user.id);
      console.log(`Cache expired for ${interaction.user.id}`); //Just for debugging
    }, 3 * 60 * 1000);

    client.timedCache.set(interaction.user.id, {
      channelId: Channel.id,
      messageType: Message,
      timeout
    });
    console.log(client.timedCache);
    const modal = new ModalBuilder().setTitle('announcement command').setCustomId('announce');

    const input1 = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          custom_id: 'message',
          placeholder:
            Message === 'message'
              ? 'Type something...'
              : 'This will appear above the embed in case you want to ping someone',
          label: 'Message',
          style: TextInputStyle.Paragraph,
          required: true
        })
      ]
    });

    const input2 = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          custom_id: 'title',
          label: 'Embed Title',
          style: TextInputStyle.Short,
          min_length: 5,
          max_length: 25,
          placeholder: 'Put title here',
          required: true
        })
      ]
    });

    const input3 = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          custom_id: 'description',
          label: 'Embed Description',
          style: TextInputStyle.Paragraph,
          min_length: 5,
          max_length: 3000,
          placeholder: 'Put description here',
          required: true
        })
      ]
    });

    const input4 = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          custom_id: 'color',
          label: 'Embed Color',
          style: TextInputStyle.Short,
          min_length: 5,
          max_length: 10,
          placeholder: 'Put color here',
          required: true
        })
      ]
    });

    const input5 = new ActionRowBuilder({
      components: [
        new TextInputBuilder({
          custom_id: 'image',
          label: 'Embed Image',
          style: TextInputStyle.Paragraph,
          min_length: 5,
          max_length: 100,
          placeholder: 'Put image here',
          required: true
        })
      ]
    });

    if (Message === 'message') {
      modal.addComponents(input1);
    } else if (Message === 'embed') {
      modal.addComponents(input2, input3, input4, input5);
    } else if (Message === 'both') {
      modal.addComponents(input2, input3, input4, input5, input1);
    }
    await interaction.showModal(modal);
  }
});
