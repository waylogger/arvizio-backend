'use strict'

const {UPLOADS_FOLDER} = require("../../globals/constants.js");
const {
  stringToFile,
  isFileExist,
  readJsonFile,
  objectToFileAsJson
} = require("../../globals/functions");

module.exports = async function (fastify, opts) {
  fastify.post('/:id', async function (request, reply) {

    const data = await request.body
    const id = request.params.id
    const projectPath = `${UPLOADS_FOLDER}/${id}`
    let settingsPath = `${projectPath}/all-settings.json`
    if (!(await isFileExist(settingsPath))) {
      await stringToFile(settingsPath, "{}")
    }
    const settings = await readJsonFile(settingsPath)
    settings.backLink = data
    await objectToFileAsJson(settingsPath, settings)

    return {status: true, message: 'done'}
  })
}