const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const client = index.getClient();

module.exports = {
    name: 'stop',
    description: 'Completely stops playback and leaves',
    // aliases: [''],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {

        var dispatcher = index.getDispatcher(message);

        if (dispatcher == undefined || dispatcher.speaking == false) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> There is nothing to skip`)
                .setColor(`#FF3838`));
        }

        index.setQueue(message, index.constructQueue());
        index.endDispatcher(message);
        index.setDispatcher(message, undefined);
        client.voice.connections.get(message.guild.id).disconnect();

        message.channel.send(new Discord.MessageEmbed()
            .setDescription(`:stop_button: ${message.author.username} stopped all playback`)
            .setColor(`#0083FF`));

    }
};