const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Client,
  Interaction,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "ban",
  description: "Bans a member from the server",
  options: [
    {
      name: "user",
      description: "The user to ban",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the ban",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],

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
      return interaction.editReply("❌ You cannot ban the server owner.");
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role position of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role position of the user making the request
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role position of the bot

    if (requestUserRolePosition <= targetUserRolePosition) {
      return interaction.editReply(
        "❌ You cannot ban this user due to role hierarchy."
      );
    }
    if (botRolePosition <= targetUserRolePosition) {
      return interaction.editReply(
        "❌ I cannot ban this user due to role hierarchy."
      );
    }

    try {
      await targetUser.ban({ reason });
      interaction.editReply(
        `✅ Successfully banned <@${targetUserId}>.\n**Reason:** \`${reason}\``
      );
    } catch (error) {
      interaction.editReply(
        "❌ An error occurred while trying to ban the user:\n" + error.message
      );
      console.error("Error banning user:", error);
    }
  },
};
