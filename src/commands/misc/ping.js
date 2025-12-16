const { Client, Interaction } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Replies with the bot's ping",
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;
    interaction.editReply(
      `Pong! 🏓\nLatency: ${ping}ms\nWS Ping: ${Math.round(client.ws.ping)}ms`
    );
  },
};
