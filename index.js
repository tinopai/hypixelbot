// Client
const Discord = require('discord.js'), client = new Discord.Client();

// Humanize Duration & Hypixel Wrapper
const humanizeDuration = require('humanize-duration');
const hypixel = require("hypixel-api-nodejs");

// Cooldowns
const cooldowns = {
    "hypixel": {
        "main": new Map(),
        "pit": new Map()
    }
};

// Important Global Variables
let 
    key = `your-hypixel-key`,           // CHANGE THIS OR THE BOT WONT WORK!
    token = `your-discord-token`,       // CHANGE THIS OR THE BOT WONT WORK!
    prefix = "h!"                       // Change this to yours!
;
// API Helpers
const embedHelper = { 
    footer: {
        text: 'Hypixel Monster by tino#0069',                                           // Change this to yours!
        image: {
            'green': 'https://cdn.discordapp.com/emojis/722990201307398204.png?v=1',
            'red':   'https://cdn.discordapp.com/emojis/722990201302941756.png?v=1'
        }
    } 
};
// Send Error Embed
function sendErrorEmbed(channel, error, description) {
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#F64B4B')
        .setTitle(`Oops!`)
        .addField(`${error}`, `${description}`)
        .setThumbnail('https://hypixel.monster/assets/images/hypixel.png')              // Change this to yours!
        .setTimestamp()
        .setFooter(embedHelper.footer.text, embedHelper.footer.image.red)
    return channel.send(exampleEmbed);
}
// Minecraft Color Name to Hex
function minecraftColorToHex(colorname) {
    switch(colorname) {
        case "BLACK":
            return "#000000";
        case "DARK_BLUE":
            return "#0100BD";
        case "DARK_GREEN":
            return "#00BF00";
        case "DARK_AQUA":
            return "#00BDBD";
        case "DARK_RED":
            return "#BE0000";
        case "DARK_PURPLE":
            return "#BC01BC";
        case "GOLD":
            return "#DB9F37";
        case "GRAY":
            return "#BEBDBE";
        case "DARK_GRAY":
            return "#3F3F3F";
        case "BLUE":
            return "#3F3FFE";
        case "GREEN":
            return "#3FFE3E";
        case "AQUA":
            return "#40FCFF";
        case "RED":
            return "#FF3E3F";
        case "LIGHT_PURPLE":
            return "#FE3FFE";
        case "YELLOW":
            return "#FEFD3F";
        case "WHITE":
            return "#FFFFFF";
    }
}
// Change games returned by the Hypixel API to clean ones
String.prototype.toCleanGameType = function() {
    switch(this.toString()) {
        case "BEDWARS": 
            return "BedWars";
        case "QUAKECRAFT":
            return "Quake";
        case "WALLS":
            return "Walls";
        case "PAINTBALL":
            return "Paintball";
        case "SURVIVAL_GAMES":
            return "Blitz Survival Games";
        case "TNTGAMES":
            return "TNT Games";
        case "VAMPIREZ":
            return "VampireZ";
        case "WALLS3":
            return "Mega Walls";
        case "ARCADE":
            return "Arcade";
        case "ARENA":
            return "Arena";
        case "UHC":
            return "UHC Champions";
        case "MCGO":
            return "Cops and Crims";
        case "BATTLEGROUND":
            return "Warlords";
        case "SUPER_SMASH":
            return "Smash Heroes";
        case "GINGERBREAD":
            return "Turbo Kart Racers";
        case "HOUSING":
            return "Housing";
        case "SKYWARS":
            return "SkyWars";
        case "TRUE_COMBAT":
            return "Crazy Walls";
        case "SPEED_UHC":
            return "Speed UHC";
        case "SKYCLASH":
            return "SkyClash";
        case "LEGACY":
            return "Classic Games";
        case "PROTOTYPE":
            return "Prototype";
        case "MURDER_MYSTERY":
            return "Murder Mystery";
        case "BUILD_BATTLE":
            return "Build Battle";
        case "DUELS":
            return "Duels";
        case "SKYBLOCK":
            return "SkyBlock";
        case "PIT":
            return "Pit";
        default:
            return "None";
    }
}
// Foreach in objects
var ObjectforEach = function (collection, callback, scope) {
    if (Object.prototype.toString.call(collection) === '[object Object]') {
      for (var prop in collection) {
        if (Object.prototype.hasOwnProperty.call(collection, prop)) {
          callback.call(scope, collection[prop], prop, collection);
        }
      }
    } else {
      for (var i = 0, len = collection.length; i < len; i++) {
        callback.call(scope, collection[i], i, collection);
      }
    }
};
// Capitalize first letter and lowercase the rest
String.prototype.capitalizeFirst = function() {
    return this.toString().charAt(0).toUpperCase() + this.toString().slice(1).toLowerCase();
}
String.prototype.toTimeString = function() {
    let num = this.toString();
    if(num < 60) return `${num}m`;
    let hours = (num / 60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    return `${rhours}h ${rminutes}m`;
}
// Add leading zeros
function pad(n){return n<10 ? '0'+n : n}

client.on('ready', s => {
    console.log(`Ready! Connected as ${client.user.username} with prefix '${prefix}'`);
    client.user.setActivity(`GitHub!`, { type: 'LISTENING' })
        .then(presence => console.log(`Activity set to '${presence.activities[0].name}'`))
        .catch(console.error);
});

client.on('message', m => {
        if(m.author.bot) return;
        const args = m.content.slice(prefix.length).split(' ');
        const command = args.shift().toLowerCase();
        
        if(command == "h" || command == "hypixel") {
            /* Cooldown */
            let cooldownT = 30 * 1000, cooldownG = cooldowns.hypixel.main.get(m.author.id);
            if(cooldownG) return m.channel.send(`Please wait ${humanizeDuration(cooldownG - Date.now(), { round: true })} before running ${command} again`);
            
            if(!args[0])  return sendErrorEmbed(m.channel, `Usage`, `${prefix}${command} <user>`);
            let tinodata = { "rank": {}, "user": {} };
            m.channel.send(`${m.author}, fetching **Hypixel API Data**`).then(medit => {
            hypixel.getPlayerByName(key, `${args[0]}`).then(user => {
                if(!user.success || user.success == false || user.player == null || user.player == undefined || !user.player) { medit.delete(); return sendErrorEmbed(m.channel, `Unknown Player`, `Player has no data in Hypixel's Database`); };
                hypixel.getGuildByPlayer(key, `${user.player.uuid}`).then(guild => {
                    switch(user.player.newPackageRank) {
                        case "MVP_PLUS":
                            tinodata.rank.displayName = "[MVP+]";
                            tinodata.rank.name = "MVP+";
                            tinodata.rank.color = minecraftColorToHex("AQUA");
                            break;
                        case "MVP":
                            tinodata.rank.displayName = "[MVP]";
                            tinodata.rank.name = "MVP";
                            tinodata.rank.color = minecraftColorToHex("AQUA");
                            break;
                        case "VIP_PLUS":
                            tinodata.rank.displayName = "[VIP+]";
                            tinodata.rank.name = "VIP+";
                            tinodata.rank.color = minecraftColorToHex("GREEN");
                            break;
                        case "VIP":
                            tinodata.rank.displayName = "[VIP]";
                            tinodata.rank.name = "VIP";
                            tinodata.rank.color = minecraftColorToHex("GREEN");
                            break;
                        default:
                            tinodata.rank.displayName = "";
                            tinodata.rank.name = "None";
                            tinodata.rank.color = minecraftColorToHex("GRAY");
                    }
                    if(user.player.monthlyPackageRank == "SUPERSTAR") {
                        tinodata.rank.displayName = "[MVP++]";
                        tinodata.rank.name = "MVP++";
                        tinodata.rank.color = minecraftColorToHex("GOLD");
                    }
                    if(user.player.rank != undefined) {
                        let rank = user.player.rank;
                        if(rank == "YOUTUBER") {
                            tinodata.rank.displayName = "[YouTuber]";
                            tinodata.rank.name = "YouTuber";
                            tinodata.rank.color = minecraftColorToHex("RED");    
                        } else {
                            tinodata.rank.displayName = "[" + rank.capitalizeFirst() + "]";
                            tinodata.rank.name = tinodata.rank.displayName.slice(1, tinodata.rank.displayName.length - 1).capitalizeFirst();
                            tinodata.rank.color = minecraftColorToHex("RED");
                        }
                    }
                    if(user.player.prefix != undefined) {
                        let prefix = user.player.prefix;
                        tinodata.rank.displayName = `[${prefix.replace(/[\[\]]|(\§a)|(\§b)|(\§c)|(\§d)|(\§e)|(\§f)|(\§0)|(\§9)|(\§8)|(\§7)|(\§6)|(\§5)|(\§4)|(\§3)|(\§2)|(\§1)|(\§b)|(\§l)|(\§c)|(\§s)|(\§n)|(\§r)/gmi, "").capitalizeFirst()}]`;
                        tinodata.rank.name = tinodata.rank.displayName.slice(1, tinodata.rank.displayName.length - 1).capitalizeFirst();
                        tinodata.rank.color = minecraftColorToHex("RED");
                    }
                    if(user.player.rankPlusColor) tinodata.rank.color = minecraftColorToHex(user.player.rankPlusColor);
                    if(user.player.userLanguage) tinodata.user.language = user.player.userLanguage.capitalizeFirst(); else tinodata.user.language = "Not set";
                    if(user.player.mcVersionRp && user.player.mcVersionRp != undefined && user.player.mcVersionRp != "") tinodata.user.version = user.player.mcVersionRp; else tinodata.user.version = "Not set";
                    if(guild && guild.guild && guild.guild != undefined && guild.guild != null && guild.success == true && guild.guild.name != undefined && guild.guild.name) tinodata.user.guild = `[${guild.guild.name}](https://hypixel.net/guilds/${guild.guild.name_lower.replace(/[ ]/, "+")})`; else tinodata.user.guild = "None";
                    if(user.player.mostRecentGameType && user.player.mostRecentGameType != undefined) tinodata.user.recentGameType = user.player.mostRecentGameType.toCleanGameType();
                    tinodata.user.level = Math.ceil((Math.sqrt(user.player.networkExp + 15312.5) - 125/Math.sqrt(2))/(25*Math.sqrt(2)));
                    let lastLogin = new Date(user.player.lastLogin);
                    let firstLogin = new Date(user.player.firstLogin);
                    const embed = new Discord.MessageEmbed()
                        .setColor(`${tinodata.rank.color}`)
                        .setAuthor(`${m.author.tag}`, `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}?size=128`)
                        .setTitle(`${tinodata.rank.displayName} ${user.player.displayname}`)
                        .setURL(`https://hypixel.net/players/${user.player.displayname}`)
                        .setThumbnail(`https://visage.surgeplay.com/head/128/${user.player.uuid}`)
                        .setImage(`https://visage.surgeplay.com/full/512/${user.player.uuid}`)
                        .addFields(
                            {name: `**Rank**`, value: `${tinodata.rank.name}`, inline: true},
                            {name: `**Karma**`, value: `${(user.player.karma == undefined) ? 0 : user.player.karma}`, inline: true},
                            {name: `**Level**`, value: `${tinodata.user.level}`, inline: true},
                            {name: `**Language**`, value: `${tinodata.user.language}`, inline: true},
                            {name: `**Version**`, value: `${tinodata.user.version}`, inline: true},
                            {name: `**Guild**`, value: `${tinodata.user.guild}`, inline: true},
                            {name: `**Recent Game Type**`, value: `${(tinodata.user.recentGameType == undefined) ? "Not set" : tinodata.user.recentGameType}`, inline: true},
                            {name: `**First Login**`, value: `${pad(firstLogin.getDate())}/${pad(firstLogin.getMonth() + 1)}/${firstLogin.getFullYear()} - ${pad(firstLogin.getHours())}:${pad(firstLogin.getMinutes())}`, inline: true},
                            {name: `**Last Login**`, value: `${pad(lastLogin.getDate())}/${pad(lastLogin.getMonth() + 1)}/${lastLogin.getFullYear()} - ${pad(lastLogin.getHours())}:${pad(lastLogin.getMinutes())}`, inline: true}
                        )
                        .setTimestamp()
                        .setFooter(embedHelper.footer.text, embedHelper.footer.image.green)
                        if(user.player.socialMedia != undefined && user.player.socialMedia.links) {
                            embed.addField(`\u200b`, `\u200b`);
                            ObjectforEach(user.player.socialMedia.links, function(value, prop, obj) {
                                if(prop == "HYPIXEL") value = `[${value.split("/")[4].split(".")[0]}](${value})`;
                                if(prop == "TWITTER") value = `[${value.split("/")[3]}](${value})`;
                                if(prop == "INSTAGRAM") value = `[${value.split("/")[3]}](${value})`;
                                if(prop == "MIXER") value = `[${value.split("/")[3]}](${value})`;
                                if(prop == "TWITCH") value = `[${value.split("/")[3]}](${value})`;
                                if(prop == "YOUTUBE" && (value.toLowerCase().includes("/channel/") || value.toLowerCase().includes("/user/") || value.toLowerCase().includes("/c/"))) value = `[${value.split("/")[4]}](${value})`;
                                if(prop == "YOUTUBE" && !(value.toLowerCase().includes("/channel/") || value.toLowerCase().includes("/user/") || value.toLowerCase().includes("/c/"))) value = `[${value.split("/")[3]}](${value})`;
                                embed.addField(`**${prop.capitalizeFirst()}**`, `${value}`, true);
                            });
                        }
                        cooldowns.hypixel.main.set(m.author.id, Date.now() + cooldownT);
                        setTimeout(() => cooldowns.hypixel.main.delete(m.author.id), cooldownT);
                        return medit.edit("\u200b", embed);
                });
            }).catch(e => function() {
                medit.edit(`Hypixel API Error`);
                console.log(e);
            });
        });
        }
        
        if(command == "pit") {
            /* Cooldown */
            let cooldownT = 30 * 1000, cooldownG = cooldowns.hypixel.pit.get(m.author.id);
            if(cooldownG) return m.channel.send(`Please wait ${humanizeDuration(cooldownG - Date.now(), { round: true })} before running ${command} again`);


            if(!args[0])  return sendErrorEmbed(m.channel, `Usage`, `${prefix}${command} <user>`);
            let tinodata = { "rank": {}, "user": {}, "pit": {} };
            hypixel.getPlayerByName(key, args[0]).then(user => {
                if(!user.success || user.success == false || user.player == null || user.player == undefined || !user.player) return sendErrorEmbed(m.channel, `Unknown Player`, `Player has no data in Hypixel's Database`);
                    switch(user.player.newPackageRank) {
                        case "MVP_PLUS":
                            tinodata.rank.displayName = "[MVP+]";
                            tinodata.rank.name = "MVP+";
                            tinodata.rank.color = minecraftColorToHex("AQUA");
                            break;
                        case "MVP":
                            tinodata.rank.displayName = "[MVP]";
                            tinodata.rank.name = "MVP";
                            tinodata.rank.color = minecraftColorToHex("AQUA");
                            break;
                        case "VIP_PLUS":
                            tinodata.rank.displayName = "[VIP+]";
                            tinodata.rank.name = "VIP+";
                            tinodata.rank.color = minecraftColorToHex("GREEN");
                            break;
                        case "VIP":
                            tinodata.rank.displayName = "[VIP]";
                            tinodata.rank.name = "VIP";
                            tinodata.rank.color = minecraftColorToHex("GREEN");
                            break;
                        default:
                            tinodata.rank.displayName = "";
                            tinodata.rank.name = "None";
                            tinodata.rank.color = minecraftColorToHex("GRAY");
                    }
                    if(user.player.monthlyPackageRank == "SUPERSTAR") {
                        tinodata.rank.displayName = "[MVP++]";
                        tinodata.rank.name = "MVP++";
                        tinodata.rank.color = minecraftColorToHex("GOLD");
                    }
                    if(user.player.rankPlusColor) tinodata.rank.color = minecraftColorToHex(user.player.rankPlusColor);

                    const embed = new Discord.MessageEmbed()
                        .setColor(`${tinodata.rank.color}`)
                        .setAuthor(`${m.author.tag}`, `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}?size=128`)
                        .setTitle(`${tinodata.rank.displayName} ${user.player.displayname}`)
                        .setURL(`https://hypixel.net/players/${user.player.displayname}`)
                        .setThumbnail(`https://visage.surgeplay.com/head/128/{user.player.uuid}`)
                        .setImage(`https://visage.surgeplay.com/full/512/${user.player.uuid}`)
                        .setTimestamp()
                        .setFooter(embedHelper.footer.text, embedHelper.footer.image.green)
                        if(!user.player.stats.Pit.pit_stats_ptl) {
                            embed.setDescription(`**The Pit**\nCould not retrieve **The Pit** Stats for this user, maybe he/she never joined The Pit!`);
                            return m.channel.send(embed);
                        }
                        embed.addFields(
                            {name: `**Kills**`, value: `${user.player.stats.Pit.pit_stats_ptl.kills}`, inline: true},
                            {name: `**Deaths**`, value: `${user.player.stats.Pit.pit_stats_ptl.deaths}`, inline: true},
                            {name: `**Assits**`, value: `${user.player.stats.Pit.pit_stats_ptl.assists}`, inline: true},
                            {name: `**KDA**`, value: `${((user.player.stats.Pit.pit_stats_ptl.kills+user.player.stats.Pit.pit_stats_ptl.assists)/user.player.stats.Pit.pit_stats_ptl.deaths).toFixed(2)}`, inline: true},
                            {name: `**Max streak**`, value: `${user.player.stats.Pit.pit_stats_ptl.max_streak}`, inline: true},
                            {name: `**Prestige**`, value: `${(!user.player.stats.Pit.profile.prestiges) ? 0 : user.player.stats.Pit.profile.prestiges.length}`, inline: true},
                            {name: `**Joins**`, value: `${user.player.stats.Pit.pit_stats_ptl.joins}`, inline: true},
                            {name: `**Jumps into pit**`, value: `${user.player.stats.Pit.pit_stats_ptl.jumped_into_pit}`, inline: true},
                            {name: `**Playtime**`, value: `${(!user.player.stats.Pit.pit_stats_ptl.playtime_minutes) ? `~0m` : user.player.stats.Pit.pit_stats_ptl.playtime_minutes.toString().toTimeString()}`, inline: true}
                        )
                        .setDescription(`Use [Pit Panda](https://pitpanda.rocks/players/${args[0]}) for more (and detailed) information!`)

                        cooldowns.hypixel.pit.set(m.author.id, Date.now() + cooldownT);
                        setTimeout(() => cooldowns.hypixel.pit.delete(m.author.id), cooldownT);
                        return m.channel.send(embed);
            });
        }
});

client.login(token);
