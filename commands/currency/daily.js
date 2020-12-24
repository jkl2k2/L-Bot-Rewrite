// const index = require(`../../index.js`);
const { MessageEmbed } = require(`discord.js`);
const prettyMs = require(`pretty-ms`);
// Any 'require'

module.exports = {
    name: 'daily',
    description: 'Daily reward',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'currency',
    execute(message, args) {
        const client = message.client;
        const casinoUser = client.casinoUser.ensure(message.author.id, client.casinoUser.default);

        const lastDailyClaim = casinoUser[`lastDailyClaim`];

        const oneDay = 24 * 60 * 60 * 1000;

        // client.casinoUser.set(message.author.id, 0, `lastDailyClaim`);

        console.log(lastDailyClaim);
        console.log(oneDay);
        console.log(oneDay - lastDailyClaim);

        if (lastDailyClaim == 0) {
            // Has not claimed before
            console.log(`Has not claimed before`);

            // Set lastDailyClaim
            client.casinoUser.set(message.author.id, Date.now(), `lastDailyClaim`);

            // Add free spin
            client.casinoUser.set(message.author.id, casinoUser[`freeSpins`] + 1, `freeSpins`);

            // Send reward message
            message.channel.send(new MessageEmbed()
                .setDescription(`<:check:728881238970073090> You got a free spin worth 10% of your balance or $5000, whichever is higher\n\n:slot_machine: Your free spins: \`${casinoUser[`freeSpins`] + 1}\``)
                .setColor(`#2EC14E`));

        } else if (Date.now() - lastDailyClaim < oneDay) {
            // Less than 1 day
            console.log(`Less than one day`);

            // Send deny message
            message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: Daily claim not ready. You claimed \`${prettyMs(Date.now() - lastDailyClaim, { compact: true, verbose: true })}\` ago.\n\n:slot_machine: **Your free spins:** \`${casinoUser[`freeSpins`]}\``)
                .setColor(`#0083FF`));

        }
        else if (Date.now() - lastDailyClaim > oneDay) {
            // Over 1 day
            console.log(`More than one day`);

            // Set lastDailyClaim
            client.casinoUser.set(message.author.id, Date.now(), `lastDailyClaim`);

            // Add free spin
            client.casinoUser.set(message.author.id, casinoUser[`freeSpins`] + 1, `freeSpins`);

            // Send reward message
            message.channel.send(new MessageEmbed()
                .setDescription(`<:check:728881238970073090> You got a free spin worth 10% of your balance or $5000, whichever is higher\n\n:slot_machine: Your free spins: \`${casinoUser[`freeSpins`] + 1}\``)
                .setColor(`#2EC14E`));

        }
    }
};