"use strict";

module.exports = async function (fastify, opts) {
  fastify.post("/", async function (request, reply) {
    return { status: true, message: "/" };
  });
};
