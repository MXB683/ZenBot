const { testServer } = require("../../../config.json");
const { Client } = require("discord.js");
const getLocalCommands = require("../../utils/getLocalCommands");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getAppComands = require("../../utils/getAppComands");

/**
 *
 * @param {Client} client
 */
module.exports = async (client) => {
  const localCommands = getLocalCommands();
  const appCommands = await getAppComands(client, testServer);

  console.log("Registering slash commands...");
  try {
    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;
      const extistingCommand = appCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (extistingCommand) {
        if (localCommand.deleted) {
          await appCommands.delete(extistingCommand.id);
          console.log(`🗑️ Deleted command: ${name}`);
          continue;
        }

        if (areCommandsDifferent(extistingCommand, localCommand)) {
          await appCommands.edit(extistingCommand.id, {
            description,
            options,
          });
          console.log(`✏️  Edited command: ${name}`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(`❌ Skipped registering deleted command: ${name}`);
          continue;
        }

        await appCommands.create({
          name,
          description,
          options,
        });
        console.log(`✅ Registered command: ${name}`);
      }
    }
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
};
