"use strict";

const fs = require("fs");
const util = require("util");
const { createFolders } = require("../../globals/functions");
const { pipeline } = require("stream");
const pump = util.promisify(pipeline);

module.exports = async function (fastify, opts) {
  fastify.post("/", async function (request, reply) {
    const data = await request.file();
    const fields = data.fields;
    console.log("Fields:", fields);
    const path = await createFolders(fields.session.value);
    await pump(data.file, fs.createWriteStream(`${path}/${data.filename}`));
    return { status: true, message: "done" };
  });
};
