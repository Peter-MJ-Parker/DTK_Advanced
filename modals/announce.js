const { ComponentModule, ComponentType } = require('../utils');
const { EmbedBuilder, MessageFlags, resolveColor } = require('discord.js');

module.exports = ComponentModule({
  customID: 'announce',
  type: ComponentType.Modal,
  async execute(client, interaction) {
    const cacheEntry = client.timedCache.get(interaction.user.id);

    if (!cacheEntry) {
      await interaction.editReply({
        content: 'This session has expired. Please run the command again.',
        ephemeral: true
      });
      return;
    }

    const { channelId, messageType } = cacheEntry;

    let Message = null;
    let Title = null;
    let Description = null;
    let Color = null;
    let Image = null;

    try {
      const Channel = await client.channels.fetch(channelId);

      let field = str => interaction.fields.getTextInputValue(str);

      if (messageType === 'message') {
        Message = field('message') || null;
      } else if (messageType === 'embed') {
        Title = field('title') || null;
        Description = field('description') || null;
        Color = resolveColor(field('color') || '#FFFFFF');
        Image = field('image') || null;
      } else {
        Message = field('message') || null;
        Title = field('title') || null;
        Description = field('description') || null;
        Color = resolveColor(field('color') || '#FFFFFF');
        Image = field('image') || null;
      }

      if (!Message && !Title && !Description) {
        throw new Error('Required fields are missing from the modal submission.');
      }

      const Embed = new EmbedBuilder()
        .setTitle(Title)
        .setDescription(Description)
        .setFooter({
          text: 'SCHOOL NAME HERE',
          iconURL:
            'https://media.discordapp.net/attachments/1368289695070683260/1369905130044133396/southgrove_academy_transparent.png?ex=681d8f12&is=681c3d92&hm=3eafb2fbbddd036044341d0610a4767d92c36e2a7aea7d4bc3730e83f418d96a&=&format=webp&quality=lossless&width=676&height=676'
        })
        .setColor(Color)
        .setTimestamp(Date.now())
        .setImage(Image);

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      await Channel.send(messageType === 'message' ? Message : { content: Message, embeds: [Embed] });

      await interaction.deleteReply();
      if (cacheEntry) client.timedCache.delete(interaction.user.id);
    } catch (error) {
      console.error('Failed to send Message: ' + error);
      await interaction.editReply({
        content: `Failed to send Message: ${error.message}`,
        ephemeral: true
      });
    }
  }
});
