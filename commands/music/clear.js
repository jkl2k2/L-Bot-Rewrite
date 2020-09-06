const index = require(`../../index.js`);
const Discord = require(`discord.js`);
// Any 'require'

module.exports = {
    name: 'clear',
    description: 'Clears the queue without stopping playback',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        var queue = message.guild.music.queue;

        if (queue == undefined || queue.length == 0) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> There is nothing to skip`)
                .setColor(`#FF3838`));
        } else {
            message.guild.music.queue = [];
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:arrow_double_up: ${message.author.username} cleared the queue`)
                .setColor(`#0083FF`));
        }
    }
};