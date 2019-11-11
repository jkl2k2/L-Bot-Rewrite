const Discord = require('discord.js');
const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'join',
	description: `Joins the user's voice channel`,
	aliases: ['j'],
	// usage: '[usage]',
	// cooldown: seconds,
	guildOnly: true,
	execute(message, args) {
		// index.callJoinVC(message);
		if (message.member.voiceChannel) {
			message.member.voiceChannel.join();
			let joinEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`:white_check_mark: Joined voice channel`, `I joined your channel, ${message.author.username}`)
				.setColor(`#44C408`)
			message.channel.send(joinEmbed);
		} else {
			let joinFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> Error joining voice channel`, `You are not in a voice channel`)
				.setColor(`#FF0000`)
			message.channel.send(joinFailEmbed);
		}
	}
}