const { MessageEmbed } = require(`discord.js`);
const genius = require(`genius-lyrics-api`);
const config = require(`config`);
const geniusAPI = config.get(`Bot.GENIUS_API`);

let lyricsSections = [];

function determineLyrics(lyrics, page) {
    lyricsSections = [];

    for (let i = 1; i < lyrics.length / 1000 + 1; i++) {
        let chunk = ``;
        chunk += lyrics.substring(0, 1000 * i);
        chunk += `...`;
        lyricsSections.push(chunk);
    }

    return lyricsSections[page - 1];
}

function makeEmbed(lyrics, result, page) {
    let embed = new MessageEmbed()
        .setTitle(result.title)
        .setURL(result.url)
        .setThumbnail(result.albumArt)
        .setDescription(determineLyrics(lyrics, page))
        .setColor(`#2EC14E`);
    return embed;
}

async function sendEmbed(message, lyrics, result, page) {
    console.log(`sendEmbed called for page ${page}`);
    return await message.channel.send(new MessageEmbed()
        .setTitle(result.title)
        .setURL(result.url)
        .setThumbnail(result.albumArt)
        .setDescription(determineLyrics(lyrics, page))
        .setColor(`#2EC14E`));
}

function reactionHandler(message, result, page, sent) {
    console.log(`reactionHandler called`);
    const filter = (reaction, user) => {
        return ['◀️', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    if (page == 0 && !lyricsSections[1]) {

        // Only first page exists

    } else if (!lyricsSections[page + 1]) {

        console.log(`last page reached`);

        // Last page
        sent.react('◀️')
            .catch(() => console.error('One of the emojis failed to react.'));

    } else if (page == 0) {

        console.log(`first page`);

        // First page
        sent.react('▶️');

    } else if (page > 0) {

        console.log(`page between first and last`);

        // Any page between first and last
        sent.react('◀️')
            .then(() => sent.react('▶️'))
            .catch(() => console.error('One of the emojis failed to react.'));

    } else {
        console.log(`message reaction catch`);
    }

    sent.awaitReactions(filter, { max: 1, time: 300000, errors: ['time'] })
        .then(async collected => {
            console.log(`collected reaction`);
            const reaction = collected.first();

            if (reaction.emoji.name === '◀️') {
                let newSent = sendEmbed(message, lyrics, result, page - 1);
                console.log(`reaction was back arrow`);

                // Previous page
                // sent.delete();

                console.log(newSent);
                console.log(`hello`);
                // let newEmbed = makeEmbed(lyrics, result, page - 1);
                // let newSent = await sent.edit(newEmbed);
                reactionHandler(message, result, page - 1, newSent);
            } else if (reaction.emoji.name === "▶️") {
                let newSent = sendEmbed(message, lyrics, result, page + 1);
                console.log(`reaction was forward arrow`);

                // Next page
                // sent.delete();
                message.channel.send(`before`);

                message.channel.send(`after`);
                console.log(newSent);
                console.log(`hello`);
                // let newEmbed = makeEmbed(lyrics, result, page - 1);
                // let newSent = await sent.edit(newEmbed);
                reactionHandler(message, result, page + 1, newSent);
            } else {
                console.log(`user reaction catch`);
            }

            console.log(`end of if block`);
        })
        .catch(async collected => {
            console.log(`collection done`);
            sent.reactions.removeAll();
        });
}

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

            genius.getLyrics(options).then(async resultLyrics => {
                lyrics = resultLyrics;

                // let sent = await message.channel.send(makeEmbed(lyrics, result, 1));
                let sent = await sendEmbed(message, resultLyrics, result, 1);

                console.log(sent);

                reactionHandler(message, resultLyrics, page, sent);
            });
        });
    }
};