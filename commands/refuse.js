const { Client, MessageAttachment, MessageEmbed, Intents, MessageButton, MessageActionRow } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const db = require('../database/db.js');

module.exports = {
    name: 'refuse',
    description: 'Accepter une candidature',
    async execute(message,args){
        if(args[0]){
            let user = message.mentions.users.first()
            let member = message.guild.members.cache.get(user.id);
            let role = message.guild.roles.cache.get("976232655593037873"); // Rôle en attente
            let role2 = message.guild.roles.cache.get("976232655593037869"); // Rôle intérimaire
            member.roles.remove(role); // Supprime le rôle en attente
            member.roles.add(role2); // Ajout du rôle Citoyen
            message.channel.delete();
        }else{
            message.channel.send('Veuillez précisez le @usertag.');
        }
    }
}