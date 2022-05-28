const { Client, MessageAttachment, MessageEmbed, Intents, MessageButton, MessageActionRow } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const db = require('../database/db.js');

module.exports = {
    name: 'email',
    description: 'Confirmer le mail',
    async execute(message,args){
        if(!message.member.permissions.has("ADMINISTRATOR")) return;
        if(args[0] && args[1]){
            db.pool.getConnection(function(err, connection) {
                // Use the connection
                connection.query(`select email from users where email = "${args[0]}"`, function (error, results, fields) {
                    console.log();
                    if(results.length == 0 || results == undefined){
                        message.channel.send('Aucun mail trouvé.')
                    }else{
                        const email = results[0]['email'];
                        let user = message.mentions.users.first()
                        connection.query(`select id from employees where dossier = "${message.channel.name}"`, function(error, results,field){
                            // When done with the connection, release it.
                            if(results !== undefined){
                                console.log(message.channel.name);
                                console.log(results);
                                let id = results[0]['id'];
                                connection.query(`update users set employee_id = "${id}", steamID = "${user.id}" where email = "${email}";`, function(error, results,field){
                                    message.channel.send('Email enregistré.');
                                if (error) throw error;
                                // Don't use the connection here, it has been returned to the pool.
                                });
                            }else{
                                message.channel.send('Email inexistant.')
                            }
                            // Don't use the connection here, it has been returned to the pool.
                        });
                    }
                // When done with the connection, release it.
                connection.release();
                // Handle error after the release.
                if (error) throw error;
                // Don't use the connection here, it has been returned to the pool.
                });
              });
        }else{
            message.channel.send('!email <email> <@usertag>')
        }
    }
}