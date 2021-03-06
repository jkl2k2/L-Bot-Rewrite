const Discord = require(`discord.js`);

module.exports = {
    name: 'muteall',
    description: 'Mutes everyone in a voice chat',
    aliases: ['ma', 'm'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'admin',
    execute(message, args) {
        const channel = message.member.voice.channel;

        if (!channel) return message.channel.send(new Discord.MessageEmbed()
            .setDescription(`<:cross:729019052571492434> ${message.author.username}, you are not in a voice channel`)
            .setColor(`#FF3838`));

        for (const member of channel.members) {
            member[1].voice.setMute(true);
        }

        return message.channel.send(new Discord.MessageEmbed()
            .setDescription(`:mute: Muted all participants`)
            .setColor(`#36393f`));
    }
};