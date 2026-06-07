import { Client, GatewayIntentBits } from "discord.js";
import { configurarTickets } from "./Sistemas/tickets.js";
import { configurarBienvenida } from "./Sistemas/bienvenida.js";
import { configurarSugerencias } from "./Sistemas/sugerencias.js";
import { configurarEncuestas } from "./Sistemas/encuestas.js";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

configurarTickets(client);
configurarBienvenida(client);
configurarSugerencias(client);
configurarEncuestas(client);

client.once("clientReady", () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!ip") {
    message.reply(
      "**KINGDOM SV**\n" +
        "IP: `play.kingdomsv.net`\n" +
        "Version: `1.8 a 1.26.1`\n" +
        "Modalidad: `Survival con Economia y Proteccion de terrenos`"
    );
  }
});
console.log("=== DEBUG RAILWAY ===");
console.log("TOKEN EXISTE:", !!process.env.DISCORD_TOKEN);
console.log("LONGITUD:", process.env.DISCORD_TOKEN?.length);
console.log("TOKEN INICIO:", process.env.DISCORD_TOKEN?.slice(0, 5));
client.login(process.env.DISCORD_TOKEN);