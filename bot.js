import sodium from "libsodium-wrappers";

import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder
} from "discord.js";

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource
} from "@discordjs/voice";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WAIT FOR SODIUM
await sodium.ready;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let connection;
const player = createAudioPlayer();

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName("join")
      .setDescription("Join your VC"),

    new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play m.mp3")
  ].map(c => c.toJSON());

  await client.application.commands.set(commands);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const vc = interaction.member.voice.channel;
  if (!vc)
    return interaction.reply({
      content: "❌ Join a VC first",
      ephemeral: true
    });

  if (interaction.commandName === "join") {
    connection = joinVoiceChannel({
      channelId: vc.id,
      guildId: vc.guild.id,
      adapterCreator: vc.guild.voiceAdapterCreator
    });

    return interaction.reply("🔊 Joined VC");
  }

  if (interaction.commandName === "play") {
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: vc.id,
        guildId: vc.guild.id,
        adapterCreator: vc.guild.voiceAdapterCreator
      });
    }

    const resource = createAudioResource(
      path.join(__dirname, "m.mp3")
    );

    connection.subscribe(player);
    player.play(resource);

    return interaction.reply("🎶 Playing m.mp3");
  }
});

client.login(process.env.TOKEN);
