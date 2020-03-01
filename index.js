// Load discord.js library and load config
const fs = require('fs');
const Discord = require('discord.js');
const config = require('config');
// const ytdl = require("ytdl-core-discord");
const ytdl = require('ytdl-core');
const chalk = require('chalk');
const winston = require('winston');

// Initialize client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// Global variables
var queue = [];
var repeat = false;

const prefix = config.get(`Bot.prefix`);
const token = config.get(`Bot.token`);
const ownerID = config.get(`Users.ownerID`);

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green',
});

const logger = winston.createLogger({
    // level: `debug`,
    transports: [
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.uncolorize()
            ),
            filename: `combined.log`,
            level: `info`
        }),
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.uncolorize()
            ),
            filename: `errors.log`,
            level: `warn`
        }),
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.uncolorize()
            ),
            filename: `debug.log`,
            level: `debug`
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                // winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                winston.format.simple()
            )
        })
    ]
});

class Activity {
    constructor(text, format) {
        this.text = text;
        this.format = format;
    }
    getText() {
        return this.text;
    }
    getFormat() {
        return this.format;
    }
}

const activities = [
    new Activity("with Cat!", "PLAYING"),
    new Activity("Sege", "PLAYING"),
    new Activity("Cat's PC melt", "WATCHING"),
    new Activity("your private convos", "WATCHING"),
    new Activity("trash music", "LISTENING"),
    new Activity("Russian spies", "LISTENING")
];

var dispatcher;
var lastDetails;
var lastPlayed;
// var lastMusicMessage;

async function sendDetails(input, c) {
    if (input.getLength() == `unknown`) {
        var musicEmbed = new Discord.RichEmbed()
            // .setColor(`#00c292`)
            .setAuthor(`▶️ Now playing`)
            // .addField(`:arrow_forward: **Now playing**`, `[${input.getTitle()}](${input.getURL()})`)
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**`)
            .addField(`Uploader`, `[${await input.getChannelName()}](${input.getChannelURL()})`, true)
            // .addField(`Length`, `${input.getLength()}`, true)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`)
    } else {
        var musicEmbed = new Discord.RichEmbed()
            // .setColor(`#00c292`)
            .setAuthor(`▶️ Now playing`)
            // .addField(`:arrow_forward: **Now playing**`, `[${input.getTitle()}](${input.getURL()})`)
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**`)
            .addField(`Uploader`, `[${await input.getChannelName()}](${input.getChannelURL()})`, true)
            .addField(`Length`, `${input.getLength()}`, true)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`)
    }
    c.send(musicEmbed);
    lastDetails = musicEmbed;
}

function sendSCDetails(input, c) {
    var scMusicEmbed = new Discord.RichEmbed()
        .setAuthor(`▶️ Now playing`)
        .setDescription(`**[${input.getCleanTitle()}](${input.getURL()})**`)
        .addField(`Uploader`, `[${input.getUploader()}](${input.getUploaderUrl()})`, true)
        .addField(`Length`, input.getLength(), true)
        .setThumbnail(input.getThumbnail())
        .setTimestamp()
        .setFooter(`Requested by ${input.getRequesterName()}`)
    c.send(scMusicEmbed);
    lastDetails = scMusicEmbed;
}

async function playMusic(message) {

    if (queue == undefined) {
        logger.warn("playMusic() called, but queue undefined");
        return;
    }

    if (queue[0] == undefined) {
        logger.warn("playMusic() called, but queue[0] is undefined");
        return;
    } else {
        if (queue[0].getType() == "youtube") {
            // If regular video

            let input = ytdl(queue[0].getURL(), { quality: "highestaudio", highWaterMark: 1 << 25 });

            var connections = client.voiceConnections.array();

            dispatcher = connections[0].playStream(input);

            sendDetails(queue[0], message.channel);
        } else if (queue[0].getType() == "soundcloud") {
            // If SoundCloud
            var connections = client.voiceConnections.array();

            dispatcher = connections[0].playStream(fs.createReadStream(`./soundcloud/${queue[0].getTitle()}`));

            sendSCDetails(queue[0], message.channel);

        } else {
            message.channel.send("Error assigning dispatcher, object at index 0 not of recognized type");
        }

        lastPlayed = queue.shift();
        if (lastPlayed && lastPlayed.getType() == "soundcloud") {
            var path = `./soundcloud/${lastPlayed.getTitle()}`;
        } else {
            var path = " ";
        }

        if (message.member.voiceChannel) {
            // Reset dispatcher stream delay
            message.member.voiceChannel.connection.player.streamingData.pausedTime = 0;

        } else {
            // Fallback in case the original user left voice channel
            var connections = client.voiceConnections.array();
            connections[0].player.streamingData.pausedTime = 0;
        }

        dispatcher.on("end", function () {
            if (repeat) {
                queue.unshift(lastPlayed);
            }
            if (path != " ") {
                fs.unlink(path, (err) => {
                    if (err) {
                        logger.error(`FAILED to delete file at path ${path}`);
                        logger.error(err);
                        return;
                    }
                    logger.info(`Removed file at path ${path}`);
                });
            }
            if (queue[0]) {
                playMusic(message);
            }
        });
    }
}

// Functions
module.exports = {
    getLogger: function () {
        return logger;
    },
    getVolume: function () {
        return dispatcher.volume;
    },
    getQueue: function () {
        return queue;
    },
    getDispatcher: function () {
        return dispatcher;
    },
    getQueue: function () {
        return queue;
    },
    getClient: function () {
        return client;
    },
    getPlaying: function () {
        if (dispatcher && dispatcher.speaking) {
            return lastDetails;
        } else {
            return new Discord.RichEmbed()
                .addField(`:information_source: Nothing is playing`, `Nothing is currently playing`)
                .setColor(`#0083FF`)
        }
    },
    getPlayingVideo: function () {
        return lastPlayed;
    },
    getRepeat: function () {
        return repeat;
    },
    setQueue: function (newQueue) {
        queue = newQueue;
    },
    setDispatcherVolume: function (newVolume) {
        dispatcher.setVolume(newVolume);
    },
    pauseMusic: function () {
        dispatcher.pause();
    },
    resumeMusic: function () {
        dispatcher.resume();
    },
    endDispatcher: function () {
        dispatcher.end();
    },
    callPlayMusic: function (message) {
        playMusic(message);
    },
    setRepeat: function (toSet) {
        repeat = toSet;
    }
};

// Load all command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

// On ready
client.on('ready', () => {
    let date = new Date();

    // Randomly select status
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities.length - 1) + 1);
        client.user.setActivity(activities[index].getText(), { type: activities[index].getFormat() });
        client.user.setStatus("online");
    }, 15000);

    logger.info(chalk.white.bgCyan(`--------Bot Initialized--------`));
    logger.info(chalk.white.bgCyan(`Timestamp: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`));
    logger.info(chalk.white.bgCyan.bold(`-------Awaiting Commands-------`));
});

client.on('error', () => {
    // On connection error
    client.user.setActivity("lost connection...", { type: "PLAYING" });
    client.user.setStatus("dnd");
});

client.on('reconnecting', () => {
    // On reconnecting to Discord
    client.user.setActivity("reconnecting...", { type: "PLAYING" });
    client.user.setStatus("dnd");
});

// On message
client.on('message', message => {
    // Return if message from bot
    if (message.author.bot) return;

    if (message.content.includes("banana")) {
        message.react('🇴')
            .then(() => (message.react('🇼'))
                .then(() => message.react('🅾️')));
    }
    // Declare reaction filter
    const filter = (reaction, user) => {
        return ['⭐'].includes(reaction.emoji.name);
    };

    // Find starboard channel by specific ID
    var starChannel = client.channels.get(`554868648964259861`);

    function checkContent(msg) {
        if (!msg.cleanContent) {
            return "*Message had no text*";
        } else {
            return msg.cleanContent;
        }
    }

    // Check for star reactions for 48 hours
    message.awaitReactions(filter, { max: 1, time: 172800000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            // If reaction is a star
            if (reaction.emoji.name === '⭐') {
                logger.info(`Message by ${message.author.username} has been starred`);
            }

            // If starboard channel exists
            if (starChannel) {
                var attachmentsArray = (message.attachments).array();

                // If image attached to message
                if (attachmentsArray[0]) {
                    let starEmbed = new Discord.RichEmbed()
                        .setTitle(`⭐ Starred Message ⭐`)
                        .addField(`Author`, message.author.username)
                        .addField(`Message`, checkContent(message))
                        .setThumbnail(message.author.avatarURL)
                        .setImage(attachmentsArray[0].url)
                        .setColor(`#FCF403`)
                        .setTimestamp()

                    starChannel.send(starEmbed);
                    logger.info(`Sent embed with image to starboard`);
                } else {
                    // If image NOT attached to image
                    let starEmbed = new Discord.RichEmbed()
                        .setTitle(`⭐ Starred Message ⭐`)
                        .addField(`Author`, message.author.username)
                        .addField(`Message`, checkContent(message))
                        .setThumbnail(message.author.avatarURL)
                        .setColor(`#FCF403`)
                        .setTimestamp()

                    starChannel.send(starEmbed);
                    logger.info(`Sent embed WITHOUT image to starboard`);
                }
            }
        })
        .catch(collected => {
            // When collector expires
        });

    // Return if no prefix
    if (!message.content.startsWith(prefix)) return;

    // Put args into array
    const args = message.content.slice(prefix.length).split(/ +/);
    const argsShifted = [...args];
    argsShifted.shift();

    logger.info(`${chalk.black.bgWhite(`${message.author.username} -> `)}${chalk.black.bgWhiteBright(`!${args[0]}`)}${chalk.black.bgWhite(` ` + argsShifted.join(` `))}`);

    // Extract command name
    const commandName = args.shift().toLowerCase();

    // Check if valid command or alias
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Return if not valid command
    if (!command) return;

    // If guild-only, no DMs allowed
    if (command.guildOnly && message.channel.type !== 'text') {
        let serverOnly = new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Sorry, that command is only usable in servers`)
            .setColor(`#FF0000`);
        return message.channel.send(serverOnly);
    }

    // If command needs arguments
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    // If command has cooldowns
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    // Set times for use with cooldown
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // Act on cooldown
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime && message.author.id != ownerID) {
            const timeLeft = (expirationTime - now) / 1000;
            let cooldownEmbed = new Discord.RichEmbed()
                .addField(`<:error:643341473772863508> Command cooldown`, `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`)
                .setColor(`#FF0000`)
            return message.channel.send(cooldownEmbed);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Attempt to execute command
    try {
        command.execute(message, args);
    } catch (error) {
        logger.error(error);
        let errorEmbed = new Discord.RichEmbed()
            .setDescription(`<:error:643341473772863508> Error executing command\n\n\`\`\`${error}\`\`\``)
            .setColor(`#FF0000`)
        message.channel.send(errorEmbed);
    }
});

// Handle uncaught promise rejections
process.on('unhandledRejection', error => logger.error(chalk.whiteBright.bgRedBright(`UNCAUGHT PROMISE REJECTION\n${error}`)));

client.login(token);