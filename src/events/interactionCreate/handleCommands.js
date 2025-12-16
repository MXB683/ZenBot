const { Client, Interaction, MessageFlags } = require("discord.js");
const { devs, testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const command = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!command) return;

    if (command.devsOnly && !devs.includes(interaction.member.id)) {
      return interaction.reply({
        content: "❌ You are forbidden from using this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
    if (command.testOnly && interaction.guildId !== testServer) {
      return interaction.reply({
        content: "❌ This command cannot be ran here.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (command.permissionsRequired?.length) {
      for (const permission of command.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          return interaction.reply({
            content: `❌ You do not have the required permissions to use this command.`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    }

    if (command.botPermissions?.length) {
      for (const permission of command.botPermissions) {
        if (!interaction.guild.members.me.permissions.has(permission)) {
          return interaction.reply({
            content: `❌ I do not have the required permissions to use this command.`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    }

    await command.execute(client, interaction);
  } catch (error) {
    console.error("❌ Error executing command:", error);
  }
};
