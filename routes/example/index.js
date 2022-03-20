"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    console.log(321203);
    return "this is an example";
  });
};
