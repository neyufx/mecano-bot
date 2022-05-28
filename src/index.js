const { channel } = require('diagnostics_channel');
const { Client, Collection, Intents, MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const db = require('../database/db.js');
const path = require('path');
const config = require('./config.json');
const prefix = "!";
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const startTimestamps = new Map();
const pad2Digits = value => String(value).padStart(2, '0');


/* Va chercher les commandes dans le dossier /commands */
bot.commands = new Collection();
const dirPath = path.resolve(__dirname, '../commands');
const commandFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`../commands/${file}`);
    bot.commands.set(command.name, command);
}

/* Vérifie que le bot est connecté */
bot.on('ready', () => {
    console.log(`Connectez en tant que : ${bot.user.tag}!`);
    bot.user.setStatus("online");
    bot.user.setActivity("Calculer les mandales");
});


  /* Création de message */
  bot.on('messageCreate', async message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    const mecanoRole = message.member.roles.cache.some(role => role.name === 'Mécano'); // vérifie si rôle mécano
    if(mecanoRole){
        if(command === 'user'){
          message.delete(1000);
          bot.commands.get('user').execute(message,args);
        }
        else if(command === 'vire'){
            message.delete(1000);
            bot.commands.get('vire').execute(message,args);
        }
        else if (command === 'custom') {
          message.delete(1000);
          bot.commands.get('custom').execute(message,args);
        }
        else if (command === 'email') {
          message.delete(1000);
          bot.commands.get('email').execute(message,args);
        }
        else if (command === 'pds') {
            message.delete(1000);
            // Sets the start time. This overrides any existing timers
            var today = new Date();
            today.setHours(today.getHours() + 2); // ajout de 2 heures pour être à jour sur l'heure locale
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            date = mm + '/' + dd + '/' + yyyy;
            hours = String(today.getHours()).padStart(2, '0')+':'+String(today.getMinutes()).padStart(2, '0')+':'+String(today.getSeconds()).padStart(2, '0');
            //console.log(today.getHours()+' '+today.getMinutes())
              startTimestamps.set(message.author.id, Date.now());
              const embedMessage = new MessageEmbed()
              .setTitle(`🔧 PDS`)
              .setDescription(`Prise de service`) //Date : ${date}\n à : ${hours}
              .addFields(
                  {name: 'Date', value: `${date}`, inline: false},
                  {name: 'Heure', value: `${hours}`, inline: false},
                  {name: 'Employé', value: `<@${message.author.id}>`, inline: false}
              )
              .setColor(`0x00FFFF`)
              .setFooter({text: '© Mécano - PDS'})
              .setTimestamp();
              message.channel.send({embeds:[embedMessage]});
          } else if (command === 'fds') {
            if (startTimestamps.has(message.author.id)) {
              message.delete(1000);
              // The user has an existing timer to stop
              // Calculate the timer result
              var today = new Date();
              today.setHours(today.getHours() + 2); // ajout de 2 heures pour être à jour sur l'heure locale
              var dd = String(today.getDate()).padStart(2, '0');
              var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
              var yyyy = today.getFullYear();
              date = yyyy + '-' + mm + '-' + dd;   
              hours = String(today.getHours()).padStart(2, '0')+':'+String(today.getMinutes()).padStart(2, '0')+':'+String(today.getSeconds()).padStart(2, '0');
              var firstdate = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
              var lastdate = new Date(today.setDate(today.getDate() - today.getDay()+6)).toISOString().split('T')[0];
              const ms = Date.now() - startTimestamps.get(message.author.id)
              const totalSecs = Math.floor(ms / 1000)
              const totalMins = Math.floor(totalSecs / 60)
              const hrs = Math.floor(totalMins / 60)
              const mins = totalMins % 60
              const secs = totalSecs % 60
              totalHours = pad2Digits(hrs)+':'+pad2Digits(mins)+':'+pad2Digits(secs);
              // Reply with result
              db.pool.getConnection(function(err, connection) {
                // Use the connection
                connection.query(`SELECT id,userID FROM employees WHERE userID = ${message.author.id}  AND dateViree is null`, function(error, result,field) {  
                    if (result[0] !== undefined){
                connection.query(`insert into services(date,time,userID,employee_id) values("${date}","${totalHours}","${result[0]['userID']}","${result[0]['id']}")`, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
                // Handle error after the release.
                if (error) throw error;
                // Don't use the connection here, it has been returned to the pool.
                });
              }
                else{
                  message.channel.send('Vous n\'êtes pas enregistré !');
                }
                });
              });

              // Délai 1s avant éxecution de la fonction
              setTimeout(function () {
                db.pool.getConnection(function(err, connection) {
                  connection.query(`SELECT TIME_FORMAT(SEC_TO_TIME(SUM(TIME_TO_SEC(time))), "%H:%i:%s") as totalHeure FROM services where userID = "${message.author.id}" and date BETWEEN "${firstdate}" AND "${lastdate}";`, function(error, result,field) {
                    const embedMessage = new MessageEmbed()
                    .setTitle(`🔧 FDS`)
                    .setDescription(`Fin de service`) // Date : ${date}\n à : ${hours}
                    .addFields(
                      {name: 'Date', value: `${date}`, inline: true},
                      {name: 'Heure', value: `${hours}`, inline: true},
                      {name: 'Durée', value: `${'```'+pad2Digits(hrs)+':'+pad2Digits(mins)+':'+pad2Digits(secs)+'```'}`, inline: false},
                      {name: 'Total Heure', value: `${'```'+result[0]['totalHeure']+'```'}`, inline: false},
                      {name: 'Employé', value: `<@${message.author.id}>`, inline: false}
                    )
                    .setColor(`0x00FFFF`)
                    .setFooter({text: '© Mécano - FDS'})
                    .setTimestamp();
                    message.channel.send({embeds:[embedMessage]});
                    connection.release();

                    if (error) throw error;

                  });
                });
              }, 1000);
              // Remove timestamp from map
              startTimestamps.delete(message.author.id)
            } else {
              // The user does not have an existing timer
              await message.reply('Vous devez utilisez `!pds` pour prendre votre service!')
            }
          }
        }

  });

  bot.on('interactionCreate', async (interaction) => {
      if(!interaction.isMessageComponent()) return;
      // si ticket n'existe pas
      if(interaction.customId === "createTicket" && !interaction.guild.channels.cache.find(channel => channel.name === 'ticket-'+interaction.user.username.toLowerCase()))
      {
        interaction.guild.channels.create('dossier-'+interaction.user.username, {
            type: 'GUILD_TEXT',
            parent: '976232656322854937', // Créer channel dans la catégorie
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny:['SEND_MESSAGES','VIEW_CHANNEL']
                },
                {
                    id: interaction.member.user.id,
                    allow: ['SEND_MESSAGES','VIEW_CHANNEL',''],
                }
            ],
          }).then(interaction.guild.roles.fetch('976232655593037873').then(role => interaction.member.roles.add(role))).then(
            channel => {
              var row = new MessageActionRow()
              .addComponents(
                new MessageButton()
                .setCustomId("close-ticket")
                .setLabel("Fermer le dossier")
                .setStyle("DANGER")
                );
                channel.send({content: "<@" + interaction.user.id + "> Voici votre dossier !", components: [row]});
            }
          );
          interaction.reply({content: "Dossier correctement crée !", ephemeral: true})
      }else if(interaction.customId === "close-ticket"){
        interaction.reply({content: "Dossier supprimé dans 5 secondes.", ephemeral: true});
        setTimeout(function () {
          interaction.channel.delete();
        }, 5000);
      }else{
        interaction.reply({content: "Un dossier est déjà ouvert !", ephemeral: true});
      }
  });

  /* Affiche les erreurs dans la console */
bot.on('error', console.error);

/* Connecte le bot avec le token fourni en paramètre */
bot.login(process.env.TOKEN); // config.token /!\ process.env.TOKEN