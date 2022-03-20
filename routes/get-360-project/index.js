'use strict'

const {UPLOADS_FOLDER} = require("../../globals/constants");
const {readFile} = require("../../globals/functions");

module.exports = async function (fastify, opts) {
  fastify.get('/:id', async function (request, reply) {

    const id = request.params.id

    try {
      let data = await readFile(`${UPLOADS_FOLDER}/${id}/space.json`)
      data = JSON.parse(data)
      return {
        status: true,
        message: "done",
        data
      }
    } catch (e) {
      return {
        status: false,
        message: JSON.stringify(e),
        data: {}
      }
    }
  })
}