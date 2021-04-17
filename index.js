const Discord = require("discord.js");
const fetch = require("node-fetch");
const Database = require("@replit/database")

const db = new Database();
const client = new Discord.Client();
const token = process.env['token']

const sadWords = ["sad", "depressed", "unhappy", "angry"];
const starterEncouragements = [
"Cheer up!", 
"Hang in there.", 
"You are a great person / bot!"
];

db.get("encouragements").then(encouragements => {
  if (!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements)
  }
});

function updateEncouragements(encouragingMessage) {
  db.get("encouragements").then(encouragements => {
    encouragements.push([encouragingMessage])
    db.set("encouragements", encouragements)
  })
}

function deleteEncouragement(index) {
  db.get("encouragements").then(encouragements => {
    if (encouragements.length > index) {
      encouragements.splice(index, 1)
      db.set("encouragements", encouragements)
    }
  })
}

function getQuote() {
  return fetch("https://zenquotes.io/api/random").then(result => {
    return result.json()
  })
  .then(data => {
    return data[0]["q"] + " - " + data[0]["a"]
  })
}


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

client.on("message", message => {
  if (message.author.bot) return

  if (message.content === "$inspire") {
    getQuote().then(quote => message.channel.send(quote))
  }

  if (sadWords.some(word => message.content.includes(word))) {
    db.get("encouragements").then(encouragements => {
      const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
      message.reply(encouragement)
    })
  }

  if (message.content.startsWith("$new")) {
    encouragingMessage = message.content.split("$new ")[1]
    updateEncouragements(encouragingMessage)
    message.channel.send("New encouraging message added.")
  }

  if (message.content.startsWith("$del")) {
    index = parseInt(message.content.split("$del ")[1])
    deleteEncouragement(index)
    message.channel.send("New encouraging message deleted.")
  }

  if (message.content.startsWith("$clear")) {
    const amount = message.content.split("$clear ")[1]
    if (!amount) return message.reply('You haven\'t given an amount of messages which should be deleted!');
    if (isNaN(amount)) return message.reply('This must be a number');

    if (amount > 100) return message.reply("You can't delete more than 100 messages at once!");
    if (amount < 1) return message.reply("You have to delete at least one message!");

    message.channel.messages.fetch({limit: amount}).then(messages => {
      message.channel.bulkDelete(messages);
    
    message.channel.send(`Cleared ${amount} messages!`)
    })
  }

});

client.login(token);
