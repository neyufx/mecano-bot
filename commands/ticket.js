const { Client, MessageAttachment, MessageEmbed, Intents, MessageButton, MessageActionRow } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const db = require('../database/db.js');

module.exports = {
    name: 'ticket',
    description: 'Créer un dossier',
    async execute(message,args){

        if(!message.member.permissions.has("ADMINISTRATOR")) return;
        const embedMessage = new MessageEmbed()
        .setTitle(`Créer votre dossier`)
        .setDescription(`Pour créer un dossier réagissez avec  📩`)
        .setColor(`0x00FFFF`)
        .setFooter({text: '© Mécano', iconURL: 'https://cdn.pixabay.com/photo/2014/06/04/16/36/man-362150__480.jpg'})
        .setTimestamp();

        const create = new MessageButton()
        .setCustomId('createTicket')
        .setStyle('PRIMARY')
        .setLabel('📩');

        const row = new MessageActionRow()
        .addComponents([create]);

        message.channel.send({
            embeds: [embedMessage],
            components: [row]
        });
        
    }
}