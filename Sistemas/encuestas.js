import { EmbedBuilder } from "discord.js";

const EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

export function configurarEncuestas(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith("!encuesta ")) return;

    if (!message.member.permissions.has("Administrator")) {
      return message.reply("Solo administradores pueden crear encuestas.");
    }

    const contenido = message.content.replace("!encuesta ", "").trim();
    const partes = contenido.split("|").map((parte) => parte.trim());

    const pregunta = partes.shift();
    const opciones = partes;

    if (!pregunta || opciones.length < 2) {
      return message.reply(
        "Uso correcto: `!encuesta pregunta | opcion 1 | opcion 2`"
      );
    }

    if (opciones.length > EMOJIS.length) {
      return message.reply("Solo puedes poner hasta 5 opciones.");
    }

    const descripcion = opciones
      .map((opcion, index) => `${EMOJIS[index]} ${opcion}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("#f1c40f")
      .setTitle("Nueva encuesta")
      .setDescription(`**${pregunta}**\n\n${descripcion}`)
      .setFooter({ text: `Encuesta creada por ${message.author.username}` })
      .setTimestamp();

    const encuesta = await message.channel.send({ embeds: [embed] });

    for (let i = 0; i < opciones.length; i++) {
      await encuesta.react(EMOJIS[i]);
    }

    await message.delete().catch(() => {});
  });
}