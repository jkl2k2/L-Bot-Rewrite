const Discord = require('discord.js');
const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'join',
	description: `Joins the user's voice channel`,
	// aliases: ['aliases'],
	usage: '[no arguments]',
	// cooldown: seconds,
	execute(message, args) {
        index.callJoinVC(message);
    }
}