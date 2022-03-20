'use strict'

const {UPLOADS_FOLDER} = require("../../globals/constants");
const {readJsonFile, isFileExist} = require("../../globals/functions");

module.exports = async function (fastify, opts) {
  fastify.get('/:id', async function (request, reply) {

    const id = request.params.id

    const settingsFileName = `${UPLOADS_FOLDER}/${id}/all-settings.json`

    let settings = {}
    try {
      if (await isFileExist(settingsFileName)) {
        settings = await readJsonFile(settingsFileName)
      }
      return {
        status: true,
        message: "done",
        settings
      }
    } catch (e) {
      return {
        status: false,
        message: JSON.stringify(e),
        settings
      }
    }
  })
}