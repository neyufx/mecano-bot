const { Client, MessageAttachment, MessageEmbed, Intents, MessageButton, MessageActionRow } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const db = require('../database/db.js');

module.exports = {
    name: 'accepte',
    description: 'Accepter une candidature',
    async execute(message,args){
        if(!message.member.permissions.has("ADMINISTRATOR")) return;
        
       if(args[0] && args[1] && args[2]){
        let arg1 = args[0];
        let arg2 = args[1];
        let arg3 = args[2];
           let user = message.mentions.users.first()
           let member = message.guild.members.cache.get(user.id);
           let role = message.guild.roles.cache.get("976232655593037873"); // Rôle en attente
           let role2 = message.guild.roles.cache.get("976232655605624882"); // Rôle intérimaire
           let channel = message.mentions.channels.first()
           member.roles.remove(role); // Supprime le rôle en attente
           member.roles.add(role2); // Ajout du rôle intérimaire
           message.channel.setParent('976232656322854937');
           message.channel.permissionOverwrites.set([
            {
                id: message.guild.id,
                deny:['SEND_MESSAGES','VIEW_CHANNEL']
            },
            {
                id: message.mentions.users.first().id,
			    allow: ['SEND_MESSAGES','VIEW_CHANNEL'],
            }
           ]);
           message.channel.setName(`${args[1]} ${args[2]}`);
           if (!member.permissions.has('ADMINISTRATOR')){
            await member.setNickname(args[1]+' '+args[2]);
           }
           db.pool.getConnection(function(err, connection) {
            // Use the connection
            connection.query(`insert into employees(prenom,nom,dossier,userID) values("${arg2}","${arg3}","${String(arg2).toLowerCase()+'-'+String(arg3).toLowerCase()}","${user.id}")`, function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();
            // Handle error after the release.
            if (error) throw error;
            // Don't use the connection here, it has been returned to the pool.
            });
          });

       }else{
           message.channel.send('Commande !accepte @usertag PrénomRP NomRP')
       }
    }
}