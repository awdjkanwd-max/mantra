import { Client, GatewayIntentBits, SlashCommandBuilder } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} from "@discordjs/voice";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      .setDescription("Join your voice channel"),

    new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play m.mp3 in voice channel")
  ].map(cmd => cmd.toJSON());

  await client.application.commands.set(commands);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const vc = interaction.member.voice.channel;
  if (!vc) {
    return interaction.reply({ content: "❌ Join a voice channel first!", ephemeral: true });
  }

  if (interaction.commandName === "join") {
    connection = joinVoiceChannel({
      channelId: vc.id,
      guildId: vc.guild.id,
      adapterCreator: vc.guild.voiceAdapterCreator
    });

    return interaction.reply("🔊 Joined your voice channel!");
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

    return interaction.reply("🎶 Playing **m.mp3**");
  }
});

client.login(process.env.TOKEN);
