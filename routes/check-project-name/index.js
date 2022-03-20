"use strict";

const { createFolders, deleteFolder } = require("../../globals/functions.js");

module.exports = async function (fastify, opts) {
  fastify.setErrorHandler(function (error, request, reply) {
    reply.send({
      status: false,
      message: error.message,
    });
  });

  fastify.get("/:projectName", async function (request, reply) {
    const projectName = request.params["projectName"];
    const projectFolder = await createFolders(projectName);
    await deleteFolder(projectFolder);
    return { status: true, message: "ok" };
  });
};
