const index = require(`../index.js`);
const config = require('config');
const api = config.get(`Bot.api2`);
const ownerID = config.get(`Users.ownerID`);
const jahyID = config.get(`Users.jahyID`);
const Discord = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const logger = index.getLogger();

class YTVideo {
    constructor(video, requester) {
        this.video = video;
        this.requester = requester;
    }
    getTitle() {
        return this.video.title;
    }
    getCleanTitle() {
        return this.video.title;
    }
    getURL() {
        return this.video.url;
    }
    getRequester() {
        return this.requester;
    }
    getRequesterName() {
        return this.requester.username;
    }
    getType() {
        return "youtube";
    }
    getThumbnail() {
        if (this.video.maxRes) {
            return this.video.maxRes.url;
        } else {
            return ``;
        }
    }
    getChannelName() {
        return this.video.channel.title;
    }
    getChannelURL() {
        return this.video.channel.url;
    }
    getLength() {
        if ((!this.video.duration) || this.video.duration.hours == 0 && this.video.duration.minutes == 0 && this.video.duration.seconds == 0) {
            return `unknown`;
        }

        if (this.video.duration.hours == 0) {
            if (this.video.duration.seconds < 10) {
                return `${this.video.duration.minutes}:0${this.video.duration.seconds}`
            } else {
                return `${this.video.duration.minutes}:${this.video.duration.seconds}`;
            }
        }
    }
    getPosition() {
        let queue = index.getQueue();
        if (queue.indexOf(this) == -1) {
            return 1;
        } else {
            return queue.indexOf(this) + 1;
        }
    }
    getVideo() {
        return this.video;
    }
}

module.exports = {
    name: 'search',
    description: 'Plays videos from YouTube by letting you select from 5 videos',
    aliases: ['psearch', 'ps', 'sp'],
    usage: '[playlist (optional)] [search term(s)]',
    cooldown: 3,
    guildOnly: true,
    execute(message, args) {

        if (!message.member.voiceChannel) {
            // If member not in VC
            if (args.join(" ").includes("playlist")) {
                handlePlaylist(false);
            } else {
                handleVideo(false);
            }

            return;
        }

        if (args[0] == undefined) {
            // If no arguments
            let undefArgsEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .setDescription(`:no_entry: Please include at least one search term or URL`)
                .setColor(`#FF0000`)
            message.channel.send(undefArgsEmbed);

            return;
        }

        var queue = index.getQueue();

        async function process(input) {
            var videoResult = input;

            logger.debug(input.title);

            let newVideo = new YTVideo(videoResult, message.author);

            queue.push(newVideo);

            if (newVideo.getLength() == "unknown") {
                var playEmbed = new Discord.RichEmbed()
                    .setTitle(` `)
                    .setAuthor(`➕ Queued`)
                    .setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**`)
                    .addField(`Uploader`, `[${newVideo.getChannelName()}](${newVideo.getChannelURL()})`, true)
                    .addField(`Position`, newVideo.getPosition(), true)
                    .setThumbnail(newVideo.getThumbnail())
                    .setTimestamp()
                    .setFooter(`Requested by ${newVideo.getRequesterName()}`)
                message.channel.send(playEmbed);
            } else {
                var playEmbed = new Discord.RichEmbed()
                    .setTitle(` `)
                    .setAuthor(`➕ Queued`)
                    .setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**`)
                    .addField(`Uploader`, `[${newVideo.getChannelName()}](${newVideo.getChannelURL()})`, true)
                    .addField(`Length`, newVideo.getLength(), true)
                    .addField(`Position`, newVideo.getPosition(), true)
                    .setThumbnail(newVideo.getThumbnail())
                    .setTimestamp()
                    .setFooter(`Requested by ${newVideo.getRequesterName()}`)
                message.channel.send(playEmbed);
            }

            if (message.member.voiceChannel) {
                message.member.voiceChannel.join()
                    .then(connection => {
                        if (index.getDispatcher() == undefined || (!connection.speaking && !index.getDispatcher().paused)) {
                            index.callPlayMusic(message);
                        }
                    })
                    .catch(logger.error);
            } else {
                logger.error("Failed to join voice channel");
            }
        }

        async function handlePlaylist(play) {
            youtube.searchPlaylists(args.join(" ").substring(9), 5)
                .then(async results => {
                    if (!results[0] && !results[1] && !results[2] && !results[3] && !results[4]) {
                        var noPlaylistFound = new Discord.RichEmbed()
                            .setDescription(`:information_source: Sorry, no playlist could be found with that input`)
                            .setColor(`#0083FF`)
                        message.channel.send(noPlaylistFound);
                        return;
                    }

                    var res1 = (await results[0].getVideos()).length;
                    var searching1 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<##-------->\``)
                        .setColor(`#0083FF`)
                    var searchingMessage = await message.channel.send(searching1);

                    var res2 = (await results[1].getVideos()).length;
                    var searching2 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<####------>\``)
                        .setColor(`#0083FF`)
                    searchingMessage.edit(searching2)

                    var res3 = (await results[2].getVideos()).length;
                    var searching3 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<######---->\``)
                        .setColor(`#0083FF`)
                    searchingMessage.edit(searching3)

                    var res4 = (await results[3].getVideos()).length;
                    var searching4 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<########-->\``)
                        .setColor(`#0083FF`)
                    searchingMessage.edit(searching4)

                    var res5 = (await results[4].getVideos()).length;
                    var searching5 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<##########>\``)
                        .setColor(`#0083FF`)
                    searchingMessage.edit(searching5)

                    var resultsEmbed = new Discord.RichEmbed()
                        .setAuthor(`Top 5 Playlists For: "${args.join(" ").substring(9)}"`)
                        .setDescription(`1. **[${results[0].title}](${results[0].url})**
                                         Length: **${res1} videos**
                                         Uploader: **${results[0].channelTitle}**

                                         2. **[${results[1].title}](${results[1].url})**
                                         Length: **${res2} videos**
                                         Uploader: **${results[1].channelTitle}**

                                         3. **[${results[2].title}](${results[2].url})**
                                         Length: **${res3} videos**
                                         Uploader: **${results[2].channelTitle}**

                                         4. **[${results[3].title}](${results[3].url})**
                                         Length: **${res4} videos**
                                         Uploader: **${results[3].channelTitle}**

                                         5. **[${results[4].title}](${results[4].url})**
                                         Length: **${res5} videos**
                                         Uploader: **${results[4].channelTitle}**`)
                        .setTimestamp()
                        .setFooter(`Requested by ${message.author.username} - Type the number to select - Type cancel to stop`)
                    searchingMessage.edit(resultsEmbed);

                    const filter = m => (m.author.id == message.author.id || m.author.id == ownerID || m.author.id == jahyID) && m.content == "1" || m.content == "2" || m.content == "3" || m.content == "4" || m.content == "5" || m.content.toLowerCase() == "cancel";

                    const collector = message.channel.createMessageCollector(filter, { time: 15000, max: 1 });

                    collector.on('collect', async m => {
                        if (m.content.toLowerCase() == "cancel") {
                            let cancelEmbed = new Discord.RichEmbed()
                                .setDescription(`:stop_button: Canceled playing from search`)
                                .setColor(`#0083FF`)
                            message.channel.send(cancelEmbed);
                            return;
                        }

                        if (play) {
                            await youtube.getPlaylist(results[parseInt(m.content) - 1].url)
                                .then(async playlist => {
                                    if (playlist) {
                                        var videos = await playlist.getVideos();

                                        var listEmbed = new Discord.RichEmbed()
                                            .setAuthor(`🔄 Processing playlist`)
                                            .setDescription(`**[${playlist.title}](${playlist.url})**`)
                                            .addField(`Uploader`, `[${playlist.channel.title}](${playlist.channel.url})`, true)
                                            .addField(`Length`, `${videos.length} videos`, true)
                                            .setThumbnail(playlist.thumbnails.default.url)
                                            .setTimestamp()
                                            .setFooter(`Requested by ${message.author.username}`)
                                        var processing = await message.channel.send(listEmbed);

                                        for (var i = 0; i < videos.length; i++) {
                                            var newVideo = new YTVideo(videos[i], message.author);
                                            queue.push(newVideo);
                                        }

                                        var finishedEmbed = new Discord.RichEmbed()
                                            .setAuthor(`➕ Queued playlist`)
                                            .setDescription(`**[${playlist.title}](${playlist.url})**`)
                                            .addField(`Uploader`, `[${playlist.channel.title}](${playlist.channel.url})`, true)
                                            .addField(`Length`, `${videos.length} videos`, true)
                                            .setThumbnail(playlist.thumbnails.default.url)
                                            .setTimestamp()
                                            .setFooter(`Requested by ${message.author.username}`)
                                        processing.edit(finishedEmbed);

                                        if (message.member.voiceChannel) {
                                            message.member.voiceChannel.join()
                                                .then(connection => {
                                                    if (index.getDispatcher() == undefined || (!connection.speaking && !index.getDispatcher().paused)) {
                                                        index.callPlayMusic(message);
                                                    }
                                                })
                                                .catch(logger.error);
                                        } else {
                                            logger.error(`User not in voice channel after playlist processing`)
                                        }
                                    } else {
                                        logger.warn(`Playlist not found`);
                                    }
                                })
                        } else {
                            message.channel.send(results[parseInt(m.content) - 1].url);
                        }
                        
                    });

                    collector.on('end', collected => {
                        // When collector expires
                    });
                })
        }

        async function handleVideo(play) {
            youtube.searchVideos(args.join(" "), 5)
                .then(async results => {
                    if (!results[0] && !results[1] && !results[2] && !results[3] && !results[4]) {
                        var noVideoFound = new Discord.RichEmbed()
                            .setDescription(`:information_source: Sorry, no video could be found with that input`)
                            .setColor(`#0083FF`)
                        message.channel.send(noVideoFound);
                        return;
                    }

                    var res1 = new YTVideo(await results[0].fetch(), message.author);
                    var searching1 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<##-------->\``)
                        .setColor(`#0083FF`)
                    var searchingMessage = await message.channel.send(searching1);

                    var res2 = new YTVideo(await results[1].fetch(), message.author);
                    var searching2 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<####------>\``)
                        .setColor(`#0083FF`)
                    searchingMessage.edit(searching2);

                    var res3 = new YTVideo(await results[2].fetch(), message.author);
                    var searching3 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<######---->\``)
                        .setColor(`#0083FF`)
                    searchingMessage.edit(searching3);

                    var res4 = new YTVideo(await results[3].fetch(), message.author);
                    var searching4 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<########-->\``)
                        .setColor(`#0083FF`)
                    searchingMessage.edit(searching4);

                    var res5 = new YTVideo(await results[4].fetch(), message.author);
                    var searching5 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<##########>\``)
                        .setColor(`#0083FF`)
                    searchingMessage.edit(searching5);

                    var resultsEmbed = new Discord.RichEmbed()
                        .setAuthor(`Top 5 Results For: "${args.join(" ")}"`)
                        .setDescription(`1. **[${results[0].title}](${results[0].url})**
                                             Length: **${res1.getLength()}**
                                             Uploader: **${res1.getChannelName()}**

                                             2. **[${results[1].title}](${results[1].url})**
                                             Length: **${res2.getLength()}**
                                             Uploader: **${res2.getChannelName()}**

                                             3. **[${results[2].title}](${results[2].url})**
                                             Length: **${res3.getLength()}**
                                             Uploader: **${res3.getChannelName()}**

                                             4. **[${results[3].title}](${results[3].url})**
                                             Length: **${res4.getLength()}**
                                             Uploader: **${res4.getChannelName()}**

                                             5. **[${results[4].title}](${results[4].url})**
                                             Length: **${res5.getLength()}**
                                             Uploader: **${res5.getChannelName()}**`)
                        .setTimestamp()
                        .setFooter(`Requested by ${message.author.username} - Type the number to select - Type cancel to stop`)
                    searchingMessage.edit(resultsEmbed);

                    const filter = m => (m.author.id == message.author.id || m.author.id == ownerID || m.author.id == jahyID) && m.content == "1" || m.content == "2" || m.content == "3" || m.content == "4" || m.content == "5" || m.content.toLowerCase() == "cancel";

                    const collector = message.channel.createMessageCollector(filter, { time: 30000, max: 1 });

                    collector.on('collect', async m => {
                        if (m.content.toLowerCase() == "cancel") {
                            let cancelEmbed = new Discord.RichEmbed()
                                .setDescription(`:stop_button: Canceled playing from search`)
                                .setColor(`#0083FF`)
                            message.channel.send(cancelEmbed);
                            return;
                        }

                        if (play) {
                            process(await youtube.getVideo(results[parseInt(m.content) - 1].url));   
                        } else {
                            message.channel.send(results[parseInt(m.content) - 1].url);
                        }
                    });

                    collector.on('end', collected => {
                        // When collector expires
                    });
                });
        }

        if (args.join(" ").includes("playlist")) {
            handlePlaylist(true);
        } else {
            handleVideo(true);
        }
    }
}