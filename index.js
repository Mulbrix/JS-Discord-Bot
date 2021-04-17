const Discord = require("discord.js");
const fetch = require("node-fetch");
const client = new Discord.Client();
const token = process.env['token']

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
});

client.login(token);
