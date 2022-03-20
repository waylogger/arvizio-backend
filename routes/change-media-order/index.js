'use strict'

const {UPLOADS_FOLDER} = require("../../globals/constants.js");
const {
  stringToFile,
  isFileExist,
  readJsonFile,
  objectToFileAsJson
} = require("../../globals/functions");

module.exports = async function (fastify, opts) {
  fastify.put('/:id', async function (request, reply) {
    /** @type {Object.<string, number>} */
    const data = await request.body
    const id = request.params.id
    const projectPath = `${UPLOADS_FOLDER}/${id}`
    let settingsPath = `${projectPath}/settings.json`
    if (!(await isFileExist(settingsPath))) {
      await stringToFile(settingsPath, "{}")
    }
    const settings = await readJsonFile(settingsPath)

    const keys = Object.keys(data)
    keys.forEach((key) => {
      const setting = settings[key]
      if (setting) {
        setting.index = data[key]
      } else {
        settings[key] = { index: data[key] }
      }
    })

    await objectToFileAsJson(settingsPath, settings)

    return {status: true, message: 'done'}
  })
}