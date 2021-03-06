const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const logger = index.getLogger();
const chalk = require(`chalk`);

module.exports = {
	name: 'playing',
	description: 'Shows the currently playing song',
	aliases: ['np'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	async execute(message, args) {
		const dispatcher = message.guild.music.dispatcher;

		if (!message.guild.music.playing) {
			const nothingPlaying = new Discord.MessageEmbed()
				.setDescription(`:information_source: Nothing is currently playing`)
				.setColor(`#36393f`);
			return message.channel.send(nothingPlaying);
		}

		const playingObj = message.guild.music.lastPlayed;

		const embed = message.guild.music.lastEmbed;

		if (playingObj.getType() == "video") {

			const playing = await message.guild.music.lastPlayed.getFullVideo();

			// let minsToSec = playing.duration.minutes * 60;
			const total = playing.duration.seconds + (playing.duration.minutes * 60) + (playing.duration.hours * 60 * 60);

			const formattedTotal = await playingObj.getLength();

			const minsPlaying = Math.trunc((dispatcher.streamTime / 1000) / 60);
			const secondsPlaying = Math.trunc((dispatcher.streamTime / 1000) - (minsPlaying * 60));

			let formattedPlaying = ``;

			if (minsPlaying < 1) {
				if (secondsPlaying < 10) {
					formattedPlaying = `0:0${secondsPlaying}`;
				} else {
					formattedPlaying = `0:${secondsPlaying}`;
				}
			} else {
				if (secondsPlaying < 10) {
					formattedPlaying = `${minsPlaying}:0${secondsPlaying}`;
				} else {
					formattedPlaying = `${minsPlaying}:${secondsPlaying}`;
				}
			}

			const frac = (dispatcher.streamTime / 1000) / total;

			let progressBar = ``;

			if (frac >= 0.9) {
				progressBar = (`\`<——————————⚪> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.8) {
				progressBar = (`\`<—————————⚪—> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.7) {
				progressBar = (`\`<————————⚪——> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.7) {
				progressBar = (`\`<———————⚪———> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.6) {
				progressBar = (`\`<——————⚪————> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.5) {
				progressBar = (`\`<—————⚪—————> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.4) {
				progressBar = (`\`<————⚪——————> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.3) {
				progressBar = (`\`<———⚪———————> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.2) {
				progressBar = (`\`<——⚪————————> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0.1) {
				progressBar = (`\`<—⚪—————————> (${formattedPlaying}/${formattedTotal})\``);
			} else if (frac >= 0) {
				progressBar = (`\`<⚪——————————> (${formattedPlaying}/${formattedTotal})\``);
			} else {
				logger.warn(chalk.black.bgYellow(`Failed to generate progress bar`));
			}

			if (message.guild.music.repeat) {
				embed.setDescription(`**[${playingObj.getTitle()}](${playingObj.getURL()})**\n[${await playingObj.getChannelName()}](${playingObj.getChannelURL()})\n\n${progressBar}\n\n\`🔁 Repeat enabled\``);
			} else {
				embed.setDescription(`**[${playingObj.getTitle()}](${playingObj.getURL()})**\n[${await playingObj.getChannelName()}](${playingObj.getChannelURL()})\n\n${progressBar}`);
			}

		} else if (playingObj.getType() == "livestream") {

			let minsPlaying = Math.trunc((dispatcher.streamTime / 1000) / 60);
			let secondsPlaying = Math.trunc((dispatcher.streamTime / 1000) - (minsPlaying * 60));

			let formattedPlaying = ``;

			if (minsPlaying < 1) {
				if (secondsPlaying < 10) {
					formattedPlaying = `0:0${secondsPlaying}`;
				} else {
					formattedPlaying = `0:${secondsPlaying}`;
				}
			} else {
				if (secondsPlaying < 10) {
					formattedPlaying = `${minsPlaying}:0${secondsPlaying}`;
				} else {
					formattedPlaying = `${minsPlaying}:${secondsPlaying}`;
				}
			}

			if (message.guild.music.repeat) {
				embed.setDescription(`**[${playingObj.getTitle()}](${playingObj.getURL()})**\n[${await playingObj.getChannelName()}](${playingObj.getChannelURL()})\n\n\`Time elapsed: ${formattedPlaying}\`\n\n\`🔁 Reconnect enabled\``);
			} else {
				embed.setDescription(`**[${playingObj.getTitle()}](${playingObj.getURL()})**\n[${await playingObj.getChannelName()}](${playingObj.getChannelURL()})\n\n\`Time elapsed: ${formattedPlaying}\`\n\n\`🔁 Reconnect disabled\`\n\`⚠️ Repeat should be on\`\n\`   for livestreams    \``);
			}
		}

		embed.setAuthor(`Currently playing`, await playingObj.getChannelThumbnail());
		embed.setThumbnail(playingObj.getThumbnail());
		embed.setFooter(`Requested by ${playingObj.getRequesterName()}`, playingObj.getRequesterAvatar());

		message.channel.send(embed);
	}
};