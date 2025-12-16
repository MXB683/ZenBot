const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const { execute } = require("./ban");
const { Client } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "timeout",
  description: "Timeouts a member in the server",
  options: [
    {
      name: "user",
      description: "The user to timeout",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "duration",
      description: "Duration of the timeout (e.g., 10m, 1h, 1d)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the timeout",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],

  /**
   *
   * @param {Client} client
   * @param {import("discord.js").Interaction} interaction
   */
  execute: async (client, interaction) => {
    const mentionable = interaction.options.get("user").value;
    const durationStr = interaction.options.get("duration").value;
    const reason =
      interaction.options.get("reason")?.value ?? "No reason provided";

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const targetMember = await interaction.guild.members
      .fetch(mentionable)
      .catch(() => null);
    if (!targetMember) {
      return interaction.editReply("❌ That user is not in this server.");
    }

    if (targetMember.user.bot) {
      return interaction.editReply("❌ You cannot timeout a bot.");
    }

    const durationMs = ms(durationStr);
    if (isNaN(durationMs) || durationMs < 5000 || durationMs > 2.4192e9) {
      return interaction.editReply(
        "❌ Please provide a valid duration between 5 seconds and 28 days."
      );
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role position of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role position of the user making the request
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role position of the bot

    if (requestUserRolePosition <= targetUserRolePosition) {
      return interaction.editReply(
        "❌ You cannot timeout this user due to role hierarchy."
      );
    }
    if (botRolePosition <= targetUserRolePosition) {
      return interaction.editReply(
        "❌ I cannot timeout this user due to role hierarchy."
      );
    }

    try {
      const { default: ms } = await import("pretty-ms");
      if (targetMember.isCommunicationDisabled()) {
        await targetMember.timeout(durationMs, reason);
        return interaction.editReply(
          `✅ Updated timeout for <@${targetUserId}> to ${ms(durationMs, {
            verbose: true,
          })}.\n**Reason:** \`${reason}\``
        );
      }
      await targetMember.timeout(durationMs, reason);
      interaction.editReply(
        `✅ Successfully timed out <@${targetUserId}> for ${ms(durationMs, {
          verbose: true,
        })}.\n**Reason:** \`${reason}\``
      );
    } catch (error) {
      interaction.editReply(
        "❌ An error occurred while trying to timeout the user:\n" +
          error.message
      );
      console.error("Error timing out user:", error);
    }
  },
};
