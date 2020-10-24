const { MessageEmbed } = require(`discord.js`);
const genius = require(`genius-lyrics-api`);
const config = require(`config`);
const geniusAPI = config.get(`Bot.GENIUS_API`);

const determineLyrics = (lyrics, page) => {

};

const sendEmbed = async (message, lyrics, page) => {
    return await message.channel.send(new MessageEmbed()
        .setTitle(result.title)
        .setURL(result.url)
        .setThumbnail(result.albumArt)
        .setDescription(determineLyrics(lyrics, page))
        .setColor(`#2EC14E`));
};

const reactionHandler = async (message, page, sent) => {
    const filter = (reaction, user) => {
        return ['◀️', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    if (page == 0 && !queue[5]) {

        // Only first page exists

    } else if (!queue[(page + 1) * 5]) {

        // Last page
        sent.react('◀️')
            .catch(() => console.error('One of the emojis failed to react.'));

    } else if (page == 0) {

        // First page
        sent.react('▶️');

    } else if (page > 0) {

        // Any page between first and last
        sent.react('◀️')
            .then(() => sent.react('▶️'))
            .catch(() => console.error('One of the emojis failed to react.'));

    }

    sent.awaitReactions(filter, { max: 1, time: 300000, errors: ['time'] })
        .then(async collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '◀️') {
                // Previous page
                sent.delete();
                let newSent = await sendEmbed(page - 1, message);
                reactionHandler(newSent, message, page - 1);
            } else if (reaction.emoji.name === "▶️") {
                // Next page
                sent.delete();
                let newSent = await sendEmbed(page + 1, message);
                reactionHandler(newSent, message, page + 1);
            }
        })
        .catch(async collected => {
            sent.reactions.removeAll();
        });
};

module.exports = {
    name: 'lyrics',
    description: 'Find the lyrics to a certain song',
    // aliases: ['aliases'],
    args: true,
    usage: '[song title]',
    altUsage: '"[song title]" by [song artist]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: false,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'music',
    async execute(message, args) {

        let page = 0;

        let result;
        let lyrics;

        let title;
        let artist;

        const argsFull = args.join(` `);

        if (argsFull.indexOf(`"`) != -1 && argsFull.indexOf(`"`, argsFull.indexOf(`"`) + 1) != -1 && argsFull.indexOf(`by`) != -1) {
            title = argsFull.substring(argsFull.indexOf(`"`) + 1, argsFull.indexOf(`"`, argsFull.indexOf(`"`) + 1));

            artist = argsFull.substring(argsFull.indexOf(`by `) + 3);
        } else if (argsFull.indexOf(`by`) != -1) {
            title = argsFull.substring(0, argsFull.indexOf(`by`));

            artist = argsFull.substring(argsFull.indexOf(`by `) + 3);
        } else {
            title = argsFull;
        }

        console.log(`Title: ${title}\nArtist: ${artist}`);

        const options = {
            apiKey: geniusAPI,
            title: title,
            artist: artist || ``,
            optimizeQuery: false
        };

        genius.searchSong(options).then(songs => {
            if (songs == null) return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> No results found`)
                .setColor(`#FF3838`));

            result = songs[0];

            genius.getLyrics(options).then(resultLyrics => {
                lyrics = resultLyrics;

                sendEmbed(message, lyrics, 1);
            });
        });
    }
};