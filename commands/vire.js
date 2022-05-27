const { Client, MessageAttachment, MessageEmbed, Intents, MessageButton, MessageActionRow } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const db = require('../database/db.js');

module.exports = {
    name: 'vire',
    description: 'Vire l\'employé',
    async execute(message,args){
        
        db.pool.getConnection(function(err, connection) {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            var date = yyyy + '/' + mm + '/' + dd;
            // Use the connection
            if(args[0]){
                let user = message.mentions.users.first()
                let member = message.guild.members.cache.get(user.id);
                connection.query(`UPDATE employee SET dateViree = "${date}" WHERE userID = "${user.id}"`, function (error, results, fields) {
                connection.query(`UPDATE users SET isViree = "${date}" WHERE steamID = "${user.id}"`, function (error, results, fields) {
                // When done with the connection, release it.
                message.channel.setParent('976232656322854936');
                connection.release();
                // Handle error after the release.
                if (error) throw error;
                // Don't use the connection here, it has been returned to the pool.
                });
            });
            }else{
                message.channel.send('Veuillez spécifier le @usertag.');
            }
        });

        
    }
}