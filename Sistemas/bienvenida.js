import {
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUTA_IMAGEN = path.join(__dirname, "..", "kingdom.png.png");

const ROL_JUGADOR_ID = "1512102883523432518";
const CANAL_BIENVENIDA_ID = "1512095424838635642";

async function enviarBienvenida(member, canal) {
  const imagen = new AttachmentBuilder(RUTA_IMAGEN, {
    name: "kingdom.png",
  });

  const embed = new EmbedBuilder()
    .setColor("#f1c40f")
    .setTitle("- BIENVENIDO A KINGDOM SV 👋")
    .setDescription(
      `Nos alegra recibirte, ${member}.\n` +
        "Por favor lee las reglas antes de interactuar en los canales.\n" +
        "Explora nuestra modalidad y si tienes dudas utiliza los canales de soporte.\n\n" +
        "Invitado mediante enlace personalizado."
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setImage("attachment://kingdom.png")
    .setFooter({ text: `Ahora somos ${member.guild.memberCount} jugadores` })
    .setTimestamp();

  const botones = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ver_reglas")
      .setLabel("Reglas")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("ver_soporte")
      .setLabel("Soporte")
      .setStyle(ButtonStyle.Secondary)
  );

  await canal.send({
    embeds: [embed],
    files: [imagen],
    components: [botones],
  });
}

export function configurarBienvenida(client) {
  client.on("guildMemberAdd", async (member) => {
  const rolJugador = member.guild.roles.cache.get(ROL_JUGADOR_ID);

  if (rolJugador) {
    await member.roles.add(rolJugador).catch(console.error);
  }

  const canal = member.guild.channels.cache.get(CANAL_BIENVENIDA_ID);
  if (!canal) return;

  await enviarBienvenida(member, canal);
});

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === "!testbienvenida") {
      try {
        await enviarBienvenida(message.member, message.channel);
      } catch (error) {
        console.error("Error al enviar bienvenida:", error);
        message.reply("No pude enviar la bienvenida. Revisa la terminal para ver el error.");
      }
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const canales = {
      ver_reglas: "1512095947327406080",
      ver_soporte: "1512096581585735730",
    };

    const canalId = canales[interaction.customId];

    if (!canalId) return;

    await interaction.reply({
      content: `Puedes ir aquí: <#${canalId}>`,
      ephemeral: true,
    });
  });
}