const fs = require("fs");
const path = require("path");
const {
  UPLOADS_FOLDER,
  FILES_PREFIX,
  ASSETS_FOLDER,
  ASSETS_PREFIX,
} = require("./globals/constants");

const fastify = require("fastify")({
  logger: true,
  // https: {
  //   key: fs.readFileSync(path.join(__dirname, "key.pem")),
  //   cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
  // },
});
const fastifyStatic = require("fastify-static");

// tools
fastify.register(require("fastify-cors"), { origin: "*" }); //manage cors response headers
fastify.register(require("fastify-multipart")); //allows to use multipart post data
fastify.register(fastifyStatic, {
  //allows to download files directly from the specified directory
  root: path.join(__dirname, UPLOADS_FOLDER),
  prefix: FILES_PREFIX,
});
fastify.register(fastifyStatic, {
  root: path.join(__dirname, ASSETS_FOLDER),
  prefix: ASSETS_PREFIX,
  decorateReply: false,
});

// // app routes
fastify.register(require("./routes"), { prefix: "api" });
fastify.post("/", async (request, reply) => {
  return { status: true, message: "/" };
});

// start server listening
const start = async () => {
  try {
    await fastify.listen(3002);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
