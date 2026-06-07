import { EmbedBuilder, PermissionsBitField } from "discord.js";
import fs from "node:fs";

const CANAL_SUGERENCIAS_ID = "1512319750179389550";
const CANAL_ACTUALIZACIONES_ID = "1512320969216229466";
const CANAL_LOGS_SUGERENCIAS_ID = "1513186658537836555";

const ARCHIVO_SUGERENCIAS = "./sugerencias.json";

function cargarDatos() {
if (!fs.existsSync(ARCHIVO_SUGERENCIAS)) {
return {
ultimoId: 0,
sugerencias: {},
};
}

try {
return JSON.parse(
fs.readFileSync(ARCHIVO_SUGERENCIAS, "utf8")
);
} catch {

return {
ultimoId: 0,
sugerencias: {},
};
}
}

function guardarDatos(datos) {
  try {
    fs.writeFileSync(
      ARCHIVO_SUGERENCIAS,
      JSON.stringify(datos, null, 2)
    );

    console.log("✅ Sugerencia guardada");
  } catch (error) {
    console.error("❌ ERROR AL GUARDAR:", error);
  }
}


function esStaff(message) {
return message.member.permissions.has(
PermissionsBitField.Flags.Administrator
);
}

export function configurarSugerencias(client) {
client.on("messageCreate", async (message) => {
if (message.author.bot) return;
if (!message.guild) return;

// =====================
// CREAR SUGERENCIA
// =====================

if (message.content.startsWith("!sugerencia ")) {
  const texto = message.content
    .replace("!sugerencia ", "")
    .trim();

  if (!texto) {
    return message.reply(
      "❌ Debes escribir una sugerencia."
    );
  }

  const canal = message.guild.channels.cache.get(
    CANAL_SUGERENCIAS_ID
  );

  if (!canal) {
    return message.reply(
      "❌ No encontré el canal de sugerencias."
    );
  }

  const datos = cargarDatos();
  console.log("📂 Datos cargados:", datos);

  datos.ultimoId++;

  const id = datos.ultimoId;

  datos.sugerencias[id] = {
    id,
    texto,
    autorId: message.author.id,
    autorNombre: message.author.username,
    estado: "pendiente",
    fecha: new Date().toISOString(),
  };
  console.log("💾 Guardando ID:", id);
  function guardarDatos(datos) {
  try {
    fs.writeFileSync(
      ARCHIVO_SUGERENCIAS,
      JSON.stringify(datos, null, 2)
    );

    console.log("✅ Sugerencia guardada");
  } catch (error) {
    console.error("❌ ERROR AL GUARDAR:", error);
  }
}


  guardarDatos(datos);

   const canalLogs = message.guild.channels.cache.get(
   CANAL_LOGS_SUGERENCIAS_ID
   );

   if (canalLogs) {
     const embedLog = new EmbedBuilder()
     .setColor("#3498db")
     .setTitle(`📋 Nueva sugerencia #${id}`)
     .addFields(
      {
        name: "👤 Usuario",
        value: `${message.author.tag}`,
      },
      {
        name: "🆔 ID",
        value: `${message.author.id}`,
      }
    )
    .setDescription(texto)
    .setTimestamp();

      await canalLogs.send({
        embeds: [embedLog],
      });
     }

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
    .setThumbnail(
      message.author.displayAvatarURL({
        size: 256,
      })
    )
    .setFooter({
      text: "KingdomBot • Sistema de Sugerencias",
    })
    .setTimestamp();

  const mensajeSugerencia =
    await canal.send({
      embeds: [embed],
    });

  await mensajeSugerencia.react("👍");
  await mensajeSugerencia.react("👎");

  const aviso = await message.reply(
    `✅ Tu sugerencia fue enviada correctamente con el número **#${id}**.`
  );

  setTimeout(() => {
    message.delete().catch(() => {});
    aviso.delete().catch(() => {});
  }, 3000);

  return;
}

// =====================
// APROBAR
// =====================

if (message.content.startsWith("!aprobar ")) {
  if (!esStaff(message)) {
    return message.reply(
      "❌ Solo administradores pueden aprobar sugerencias."
    );
  }

  const id = message.content
    .replace("!aprobar ", "")
    .trim();

  const datos = cargarDatos();

  const sugerencia =
    datos.sugerencias[id];

  if (!sugerencia) {
    return message.reply(
      "❌ No encontré una sugerencia con ese número."
    );
  }

  if (sugerencia.estado === "aprobada") {
    return message.reply(
      "❌ Esa sugerencia ya fue aprobada."
    );
  }

  if (sugerencia.estado === "rechazada") {
    return message.reply(
      "❌ Esa sugerencia ya fue rechazada."
    );
  }

  sugerencia.estado = "aprobada";
  sugerencia.aprobadaPor = message.author.id;
  sugerencia.aprobadaEn =
    new Date().toISOString();

  guardarDatos(datos);

  const canalLogs = message.guild.channels.cache.get(
  CANAL_LOGS_SUGERENCIAS_ID
);

if (canalLogs) {
  await canalLogs.send(
    `✅ Sugerencia #${id} aprobada por ${message.author.tag}`
  );
}

  const canalActualizaciones =
    message.guild.channels.cache.get(
      CANAL_ACTUALIZACIONES_ID
    );

  if (canalActualizaciones) {
    const embed =
      new EmbedBuilder()
        .setColor("#2ecc71")
        .setTitle(
          "✅ Sugerencia Aprobada"
        )
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
      embeds: [embed],
    });
  }

  await message.reply(
    `✅ La sugerencia #${id} fue aprobada y publicada en actualizaciones.`
  );

  return;
}

// =====================
// RECHAZAR
// =====================

if (message.content.startsWith("!rechazar ")) {
  if (!esStaff(message)) {
    return message.reply(
      "❌ Solo administradores pueden rechazar sugerencias."
    );
  }

  const contenido = message.content
    .replace("!rechazar ", "")
    .trim();

  const partes =
    contenido.split(" ");

  const id = partes.shift();

  const razon =
    partes.join(" ").trim();

  if (!id) {
    return message.reply(
      "❌ Uso correcto: !rechazar numero razon"
    );
  }

  if (!razon) {
    return message.reply(
      "❌ Debes escribir una razón."
    );
  }

  const datos = cargarDatos();

  const sugerencia =
    datos.sugerencias[id];

  if (!sugerencia) {
    return message.reply(
      "❌ No encontré una sugerencia con ese número."
    );
  }

  if (sugerencia.estado === "aprobada") {
    return message.reply(
      "❌ Esa sugerencia ya fue aprobada."
    );
  }

  if (sugerencia.estado === "rechazada") {
    return message.reply(
      "❌ Esa sugerencia ya fue rechazada."
    );
  }

  sugerencia.estado = "rechazada";
  sugerencia.rechazadaPor =
    message.author.id;
  sugerencia.rechazadaEn =
    new Date().toISOString();
  sugerencia.razonRechazo =
    razon;

  guardarDatos(datos);

  const canalLogs = message.guild.channels.cache.get(
  CANAL_LOGS_SUGERENCIAS_ID
);

if (canalLogs) {
  await canalLogs.send(
    `❌ Sugerencia #${id} rechazada por ${message.author.tag}\n📌 Razón: ${razon}`
  );
}
  const canalActualizaciones =
    message.guild.channels.cache.get(
      CANAL_ACTUALIZACIONES_ID
    );

  if (canalActualizaciones) {
    const embed =
      new EmbedBuilder()
        .setColor("#e74c3c")
        .setTitle("❌ Sugerencia Rechazada")

     .setDescription(`
💡 **Una sugerencia de la comunidad ha sido rechazada.**

👤 **Autor:** <@${sugerencia.autorId}>

📝 **Sugerencia:**
${sugerencia.texto}

📌 **Razón:**
${razon}
`)
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
      embeds: [embed],
    });
  }

      await message.reply(
    `❌ La sugerencia #${id} fue rechazada y publicada en actualizaciones.`
  );

  return;
} // Cierra !rechazar

}); // Cierra client.on

} // Cierra configurarSugerencias 