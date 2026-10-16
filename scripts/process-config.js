const fs = require("fs");
const YAML = require("yaml");

function processConfig(stage) {
  try {
    const configFileName = `app.${stage}.config.yml`;

    if (!fs.existsSync(configFileName)) {
      throw new Error(`Config file not found: ${configFileName}`);
    }

    const configFile = fs.readFileSync(configFileName, "utf8");
    const config = YAML.parse(configFile);

    if (!config?.parameters?.[0]?.default) {
      throw new Error("Invalid config structure");
    }

    return config.parameters[0].default.map((app) => ({
      functionType: app.functionType,
      appName: app.appName,
      queues: app.queues,
    }));
  } catch (error) {
    const sanitizedError = error.message.replace(/[\r\n]/g, " ");
    console.error(`Erro ao processar configuração: ${sanitizedError}`);
    process.exit(1);
  }
}

const command = process.argv[2];
const stage = process.argv[3] || "dev";

if (command === "functions") {
  console.log(JSON.stringify(processConfig(stage)));
}
