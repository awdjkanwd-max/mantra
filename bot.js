import "dotenv/config";

import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder
} from "discord.js";

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior
} from "@discordjs/voice";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let connection;
const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play
  }
});

// READY
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName("join")
      .setDescription("Join your voice channel"),

    new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play mp3")
      .addStringOption(o =>
        o
          .setName("file")
          .setDescription("Choose file")
          .setRequired(true)
          .addChoices(
            { name: "m.mp3", value: "m" },
            { name: "a.mp3", value: "a" }
          )
      )
  ].map(c => c.toJSON());

  await client.application.commands.set(commands);
});

// COMMANDS
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const vc = interaction.member.voice.channel;
  if (!vc) {
    return interaction.reply({
      content: "❌ Join a voice channel first",
      ephemeral: true
    });
  }

  // JOIN
  if (interaction.commandName === "join") {
    connection = joinVoiceChannel({
      channelId: vc.id,
      guildId: vc.guild.id,
      adapterCreator: vc.guild.voiceAdapterCreator
    });

    return interaction.reply("🔊 Joined your VC");
  }

  // PLAY
  if (interaction.commandName === "play") {
    const file = interaction.options.getString("file");
    const mp3 = file === "a" ? "a.mp3" : "m.mp3";

    if (!connection) {
      connection = joinVoiceChannel({
        channelId: vc.id,
        guildId: vc.guild.id,
        adapterCreator: vc.guild.voiceAdapterCreator
      });
    }

    const resource = createAudioResource(
      path.join(__dirname, mp3)
    );

    connection.subscribe(player);
    player.play(resource);

    return interaction.reply(`🎶 Playing **${mp3}**`);
  }
});

// LOGIN
client.login(process.env.TOKEN);
