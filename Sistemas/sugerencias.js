import { EmbedBuilder, PermissionsBitField } from "discord.js";
import fs from "node:fs";

const CANAL_SUGERENCIAS_ID = "1512319750179389550";
const CANAL_ACTUALIZACIONES_ID = "1512320969216229466";

const ARCHIVO_SUGERENCIAS = ".sugerencias.json";

function cargarDatos() {
  if (!fs.existsSync(ARCHIVO_SUGERENCIAS)) {
    return {
      ultimoId: 0,
      sugerencias: {},
    };
  }

  return JSON.parse(fs.readFileSync(ARCHIVO_SUGERENCIAS, "utf8"));
}

function guardarDatos(datos) {
  fs.writeFileSync(ARCHIVO_SUGERENCIAS, JSON.stringify(datos, null, 2));
}

function esStaff(message) {
  return message.member.permissions.has(PermissionsBitField.Flags.Administrator);
}

export function configurarSugerencias(client) {


  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith("!sugerencia ")) {
      const texto = message.content.replace("!sugerencia ", "").trim();

      if (!texto) {
        return message.reply("Escribe tu sugerencia despues del comando.");
      }

      const canal = message.guild.channels.cache.get(CANAL_SUGERENCIAS_ID);

      if (!canal) {
        return message.reply("No encontre el canal de sugerencias.");
      }

      const datos = cargarDatos();
      datos.ultimoId++;

      const id = datos.ultimoId;

      datos.sugerencias[id] = {
        id,
        texto,
        autorId: message.author.id,
        autorNombre: message.author.username,
        estado: "pendiente",
      };

      guardarDatos(datos);

      const embed = new EmbedBuilder()
  .setColor("#f1c40f")
  .setTitle(`💡 Sugerencia #${id}`)
  .setDescription(texto)
  .addFields(
    {
      name: "👤 Autor",
      value: `${message.author}`,
      inline: true,
    },
    {
      name: "📌 Estado",
      value: "🟡 Pendiente",
      inline: true,
    }
  )
  .setThumbnail(message.author.displayAvatarURL({ size: 256 }))
  .setFooter({
    text: "KingdomBot • Sistema de Sugerencias",
  })
  .setTimestamp();

const sugerencia = await canal.send({
  embeds: [embed],
});

await sugerencia.react("👍");
await sugerencia.react("👎");

const aviso = await message.reply(
  `✅ Tu sugerencia fue enviada correctamente con el número **#${id}**.`
);

setTimeout(() => {
  message.delete().catch(() => {});
  aviso.delete().catch(() => {});
}, 3000);

return;
    }

    if (message.content.startsWith("!aprobar ")) {
if (!esStaff(message)) {
return message.reply("Solo administradores pueden aprobar sugerencias.");
}

const id = message.content.replace("!aprobar ", "").trim();
const datos = cargarDatos();
const sugerencia = datos.sugerencias[id];

if (!sugerencia) {
return message.reply("No encontre una sugerencia con ese numero.");
}

if (sugerencia.estado === "aprobada") {
return message.reply("Esa sugerencia ya fue aprobada.");
}

if (sugerencia.estado === "rechazada") {
return message.reply("Esa sugerencia ya fue rechazada.");
}

const canalActualizaciones = message.guild.channels.cache.get(
CANAL_ACTUALIZACIONES_ID
);

if (!canalActualizaciones) {
return message.reply("No encontre el canal de actualizaciones.");
}

sugerencia.estado = "aprobada";
sugerencia.aprobadaPor = message.author.id;
sugerencia.aprobadaEn = new Date().toISOString();

guardarDatos(datos);

const embedActualizacion = new EmbedBuilder()
.setColor("#2ecc71")
.setTitle("✅ Sugerencia Aprobada")
.setDescription(
`💡 **Una sugerencia de la comunidad ha sido aceptada.**\n\n` +
`👤 **Autor:** <@${sugerencia.autorId}>\n\n` +
`📝 **Sugerencia:**\n${sugerencia.texto}`
)
.addFields({
name: "📌 Estado",
value: "🟢 Aprobada",
inline: true,
})
.setFooter({
text: `Kingdom SV • Sugerencia #${id}`,
})
.setTimestamp();

await canalActualizaciones.send({
embeds: [embedActualizacion],
});

await message.reply(
`✅ La sugerencia #${id} fue aprobada y publicada en actualizaciones.`
);

return;
}

    if (message.content.startsWith("!rechazar ")) {
if (!esStaff(message)) {
return message.reply("Solo administradores pueden rechazar sugerencias.");
}

const contenido = message.content.replace("!rechazar ", "").trim();
const partes = contenido.split(" ");
const id = partes.shift();
const razon = partes.join(" ").trim();

if (!id) {
return message.reply("Uso correcto: !rechazar numero razon");
}

if (!razon) {
return message.reply(
"Debes escribir una razon para rechazar la sugerencia."
);
}

const datos = cargarDatos();
const sugerencia = datos.sugerencias[id];

if (!sugerencia) {
return message.reply("No encontre una sugerencia con ese numero.");
}

if (sugerencia.estado === "aprobada") {
return message.reply("Esa sugerencia ya fue aprobada.");
}

if (sugerencia.estado === "rechazada") {
return message.reply("Esa sugerencia ya fue rechazada.");
}

sugerencia.estado = "rechazada";
sugerencia.rechazadaPor = message.author.id;
sugerencia.rechazadaEn = new Date().toISOString();
sugerencia.razonRechazo = razon;

guardarDatos(datos);

const canalActualizaciones = message.guild.channels.cache.get(
CANAL_ACTUALIZACIONES_ID
);

if (canalActualizaciones) {
const embedRechazo = new EmbedBuilder()
.setColor("#e74c3c")
.setTitle("❌ Sugerencia Rechazada")
.setDescription(
`💡 **Una sugerencia de la comunidad ha sido rechazada.**\n\n` +
`👤 **Autor:** <@${sugerencia.autorId}>\n\n` +
`📝 **Sugerencia:**\n${sugerencia.texto}\n\n` +
`📌 **Razón:**\n${razon}`
)
.addFields({
name: "Estado",
value: "🔴 Rechazada",
inline: true,
})
.setFooter({
text: `Kingdom SV • Sugerencia #${id}`,
})
.setTimestamp();


await canalActualizaciones.send({
  embeds: [embedRechazo],
});


}

await message.reply(
`❌ La sugerencia #${id} fue rechazada y publicada en actualizaciones.`
);

return;
}

  });
}