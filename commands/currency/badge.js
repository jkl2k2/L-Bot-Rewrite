const index = require(`../../index.js`);
const { MessageEmbed } = require(`discord.js`);
const currency = index.getCurrencyDB();

function readableNum(number) {
    return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
    name: 'badge',
    description: 'Use your money to buy badges',
    aliases: ['badges'],
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

        if (args.length == 0) {
            // If no args provided
            return message.channel.send(new MessageEmbed()
                .setAuthor(message.author.username, message.author.avatarURL())
                .addField(`Badge level`, `\`Badge ${casinoUser[`badgeLevel`]}\``, true)
                // .addField(`Prestige level`, `\`Prestige ${casinoUser[`prestigeLevel`]}\``, true)
                .addField(`Next badge`, `\`Badge ${casinoUser[`badgeLevel`] + 1}\` (**$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`]))}**)`)
                .setColor(`#36393f`));

        } else if (args[0] == `upgrade`) {
            // If user wants to upgrade
            // Check if user can afford upgrade
            if (currency.getBalance(message.author.id) >= Math.pow(10, 4 + casinoUser[`badgeLevel`])) {
                // Show upgrade info
                message.channel.send(new MessageEmbed()
                    .setDescription(`<:check:728881238970073090> You can afford to upgrade your badge to \`Badge ${casinoUser[`badgeLevel`] + 1}\` for \`$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`]))}\`\n\nCurrent balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\nBalance after: \`$${readableNum(currency.getBalance(message.author.id) - Math.pow(10, 4 + casinoUser[`badgeLevel`]))}\`\n\nWould you like to upgrade? **(Y/N)**`)
                    .setColor(`#2EC14E`));

                // Listen for response
                const filter = response => response.author.id == message.author.id && (response.content.toLowerCase() == `y` || response.content.toLowerCase() == `n` || response.content.toLowerCase() == `yes` || response.content.toLowerCase() == `no`);

                const collector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                collector.on(`collect`, async response => {
                    const userResponse = response.content.toLowerCase();

                    if (userResponse == `y` || userResponse == `yes`) {
                        // Store old balance
                        const oldBalance = currency.getBalance(message.author.id);

                        // Collect payment
                        currency.add(message.author.id, -Math.pow(10, 4 + casinoUser[`badgeLevel`]));

                        // Increase badge level
                        client.casinoUser.set(message.author.id, casinoUser[`badgeLevel`] + 1, `badgeLevel`);

                        // Show confirmation of upgrade
                        return message.channel.send(new MessageEmbed()
                            .setDescription(`:tada: You have now reached \`Badge ${casinoUser[`badgeLevel`] + 1}\`!\n\nPrevious balance: \`$${readableNum(oldBalance)}\`\nNew balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\n\nNext up is \`Badge ${casinoUser[`badgeLevel`] + 2}\` (\`$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`] + 1))}\`)`)
                            .setColor(`#2EC14E`));

                    } else if (userResponse == `n` || userResponse == `no`) {
                        return message.channel.send(`Canceled upgrade.`);
                    }
                });
                collector.on('end', collected => {
                    // Name entry timed out
                    if (!collected.size) return message.channel.send(new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Badge upgrade response timed out`)
                        .setColor(`#FF3838`));
                });
            } else {
                // User cannot afford badge upgrade
                message.channel.send(new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> You cannot afford to upgrade your badge to \`Badge ${casinoUser[`badgeLevel`] + 1}\`\n\nCurrent balance: \`$${readableNum(currency.getBalance(message.author.id))}\`\nBadge costs: \`$${readableNum(Math.pow(10, 4 + casinoUser[`badgeLevel`]))}\``)
                    .setColor(`#FF3838`));
            }
        }
    }
};