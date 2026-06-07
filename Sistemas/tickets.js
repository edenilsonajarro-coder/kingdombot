import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import fs from "node:fs";

const ROL_STAFF_ID = "1512172390547984404";
const CATEGORIA_TICKETS_ID = "1512096548388081674";
const CANAL_LOGS_TICKETS_ID = "1513187004219920526";

const ARCHIVO_CONTADOR = "./contador-tickets.json";

function obtenerNumeroTicket() {
  let datos = { ultimoTicket: 0 };

  if (fs.existsSync(ARCHIVO_CONTADOR)) {
    datos = JSON.parse(fs.readFileSync(ARCHIVO_CONTADOR, "utf8"));
  }

 datos.ultimoTicket++;
  fs.writeFileSync(ARCHIVO_CONTADOR, JSON.stringify(datos, null, 2));

  return datos.ultimoTicket;
}

export function configurarTickets(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

   if (message.content === "!paneltickets") {
  if (
    !message.member.roles.cache.has(ROL_STAFF_ID) &&
    !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
     ) {
    return message.reply("Solo el staff puede crear el panel de tickets.");
       }

      const embed = new EmbedBuilder()
        .setColor("#f1c40f")
        .setTitle("Soporte de Kingdom SV")
        .setDescription(
          "Necesitas ayuda? Abre un ticket y el staff te atendera lo antes posible.\n\n" +
            "Presiona el boton de abajo para crear tu ticket de soporte."
        );

      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("abrir_ticket")
          .setLabel("Abrir ticket")
          .setStyle(ButtonStyle.Primary)
      );

      await message.channel.send({
        embeds: [embed],
        components: [botones],
      });
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "abrir_ticket") {
      const guild = interaction.guild;
      const usuario = interaction.user;
      const numeroTicket = obtenerNumeroTicket();

      const ticketExistente = guild.channels.cache.find(
        (canal) => canal.topic === `ticket-${usuario.id}`
      );

      if (ticketExistente) {
        return interaction.reply({
          content: `Ya tienes un ticket abierto: ${ticketExistente}`,
          ephemeral: true,
        });
      }

      const canalTicket = await guild.channels.create({
        name: `ticket-${numeroTicket}-${usuario.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORIA_TICKETS_ID,
        topic: `ticket-${usuario.id}`,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: usuario.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
          {
            id: ROL_STAFF_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.ManageChannels,
            ],
          },
        ],
      });

      const embedTicket = new EmbedBuilder()
        .setColor("#f1c40f")
        .setTitle("Ticket de soporte abierto")
        .setDescription(
          `Abriste ticket de soporte, ${usuario}.\n\n` +
            `Usuario: ${usuario.username}\n` +
            `Numero de ticket: #${numeroTicket}\n\n` +
            "Describe tu problema y espera a que el staff te responda."
        );

      const botonCerrar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("cerrar_ticket")
          .setLabel("Cerrar ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await canalTicket.send({
        content: `${usuario} <@&${ROL_STAFF_ID}>`,
        embeds: [embedTicket],
        components: [botonCerrar],
      });

      const canalLogs = guild.channels.cache.get(
  CANAL_LOGS_TICKETS_ID
);

console.log("Canal logs:", canalLogs?.name);
console.log("ID buscado:", CANAL_LOGS_TICKETS_ID);

if (canalLogs) {
  const embedLog = new EmbedBuilder()
    .setColor("#2ecc71")
    .setTitle("🎫 Ticket Creado")
    .addFields(
      {
        name: "👤 Usuario",
        value: usuario.tag,
        inline: true,
      },
      {
        name: "🆔 ID",
        value: usuario.id,
        inline: true,
      },
      {
        name: "📂 Ticket",
        value: canalTicket.name,
        inline: false,
      }
    )
    .setTimestamp();

  await canalLogs.send({
    embeds: [embedLog],
  });
}

      await interaction.reply({
        content: `Tu ticket fue creado: ${canalTicket}`,
        ephemeral: true,
      });
    }

    if (interaction.customId === "cerrar_ticket") {
  if (!interaction.member.roles.cache.has(ROL_STAFF_ID)) {
    return interaction.reply({
      content: "Solo el staff puede cerrar tickets.",
      ephemeral: true,
    });
  }

  const canalLogs = interaction.guild.channels.cache.get(
    CANAL_LOGS_TICKETS_ID
  );

  if (canalLogs) {
    const embedLog = new EmbedBuilder()
      .setColor("#e74c3c")
      .setTitle("🔒 Ticket Cerrado")
      .addFields(
        {
          name: "👮 Staff",
          value: interaction.user.tag,
          inline: true,
        },
        {
          name: "📂 Ticket",
          value: interaction.channel.name,
          inline: true,
        }
        {
          name: "🆔 Staff ID",
          value: interaction.user.id,
          inline: false,
        }
      )
      .setTimestamp();

    await canalLogs.send({
      embeds: [embedLog],
    });
  }

  await interaction.reply(
    "🔒 Este ticket se cerrará en 5 segundos."
  );

  setTimeout(() => {
    interaction.channel.delete().catch(() => {});
  }, 5000);
}
  });
}