const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Client,
  Interaction,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "kick",
  description: "Kicks a member from the server",
  options: [
    {
      name: "user",
      description: "The user to kick",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the kick",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const targetUserId = interaction.options.get("user").value;
    const reason =
      interaction.options.get("reason")?.value ?? "No reason provided";
    const targetUser = await interaction.guild.members
      .fetch(targetUserId)
      .catch(() => null);

    if (!targetUser) {
      return interaction.editReply("❌ That user is not in this server.");
    }

    if (targetUserId === interaction.guild.ownerId) {
      return interaction.editReply("❌ You cannot kick the server owner.");
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role position of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role position of the user making the request
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role position of the bot

    if (requestUserRolePosition <= targetUserRolePosition) {
      return interaction.editReply(
        "❌ You cannot kick this user due to role hierarchy."
      );
    }
    if (botRolePosition <= targetUserRolePosition) {
      return interaction.editReply(
        "❌ I cannot kick this user due to role hierarchy."
      );
    }

    try {
      await targetUser.kick({ reason });
      interaction.editReply(
        `✅ Successfully kicked <@${targetUserId}>.\n**Reason:** \`${reason}\``
      );
    } catch (error) {
      interaction.editReply(
        "❌ An error occurred while trying to kick the user:\n" + error.message
      );
      console.error("Error kicking user:", error);
    }
  },
};
