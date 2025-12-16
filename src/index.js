require("dotenv").config({ quiet: true });
const { Client, IntentsBitField } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

console.log("Starting...\n");

(() => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("🥬 Connected to MongoDB\n");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
})();

eventHandler(client);

client.login(process.env.TOKEN);
