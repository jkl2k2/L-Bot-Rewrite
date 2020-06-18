const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const client = index.getClient();

module.exports = {
    name: 'listservers',
    description: 'Template command for easier coding, does nothing',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
	/*
	restrictions: {
		resolvable: [],
		id: [],
	},
	*/
    type: 'admin',
    execute(message, args) {
        var count = 0;
        var msg = "";
        for (var server of client.guilds.array()) {
            msg += server.name;
            msg += "\n";
            count++;
        }
        message.channel.send(new Discord.RichEmbed()
            .setDescription(`**__Servers__**\n\n${msg}\n**Total: ${count} servers**`));
    }
};