'use strict'

const {UPLOADS_FOLDER} = require("../../globals/constants.js");
const {
  stringToFile,
  isFileExist,
  readJsonFile,
  objectToFileAsJson
} = require("../../globals/functions");

module.exports = async function (fastify, opts) {
  fastify.post('/:id/:mediaName', async function (request, reply) {

    const data = await request.body
    const id = request.params.id
    const mediaName = request.params.mediaName
    const projectPath = `${UPLOADS_FOLDER}/${id}`
    let settingsPath = `${projectPath}/settings.json`
    if (!(await isFileExist(settingsPath))) {
      await stringToFile(settingsPath, "{}")
    }
    const settings = await readJsonFile(settingsPath)
    if (!settings[mediaName]) {
      settings[mediaName] = {}
    }
    settings[mediaName].inversions = data
    await objectToFileAsJson(settingsPath, settings)

    return {status: true, message: 'done'}

  })
}