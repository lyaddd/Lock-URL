const
    Discord = require("discord.js-selfbot-v13"),
    axios = require('axios'),
    client = new Discord.Client({ checkUpdate: false }),
    labandite = ["861946846163370036", "ID WL"];

client.on('ready', async () => {
    console.log(`Connecter sur ${client.user.tag}`)
})

let slm = false;

client.on('messageCreate', async message => {
    if (message.author.id !== client.user.id) return;
    if (message.content === '.lock') {
        slm = true;
        message.channel.send('Le serveur a été verrouillé. Les modifications d\'URL sont désormais interdites.');
    } else if (message.content === '.unlock') {
        slm = false;
        message.channel.send('Le serveur a été déverrouillé. Les modifications d\'URL sont désormais autorisées.');
    }
});

client.on('guildUpdate', async (oldGuild, newGuild) => {
    if (!slm) return;
    if (newGuild.vanityURLCode !== oldGuild.vanityURLCode) {
        const action = await oldGuild.fetchAuditLogs({ limit: 1, type: "GUILD_UPDATE" }).then(async (audit) => audit.entries.first());
        if (action.executor.id === client.user.id || labandite.includes(action.executor.id)) return;

        axios.patch(`https://discord.com/api/v9/guilds/${oldGuild.id}/vanity-url`, {
            code: oldGuild.vanityURLCode
        }, {
            headers: {
                "content-Type": "application/json",
                "authorization": `${client.token}`
            }
        }).catch(console.error);

        const member = await oldGuild.members.fetch(action.executor.id);
        if (member) {
            member.roles.remove(member.roles.cache).catch(console.error);
        }
    }
});

client.login('');