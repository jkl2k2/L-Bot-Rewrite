// const index = require(`../../index.js`);
// const Discord = require(`discord.js`);
// const config = require(`config`);
// Any 'require'

module.exports = {
    name: 'resetdaily',
    description: 'Reset daily timer',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [`125109015632936960`],
    },
    type: 'currency',
    execute(message, args) {
        const client = message.client;
        client.casinoUser.set(message.author.id, 0, `lastDailyClaim`);
        console.log(`Set user lastDailyClaim to 0`);
    }
};