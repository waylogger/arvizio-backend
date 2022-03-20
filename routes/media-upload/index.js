'use strict'

const fs = require('fs')
const util = require('util')
const {UPLOADS_FOLDER} = require("../../globals/constants.js");
const {
  createFolders,
  extractFileExtension,
  constructThumbFileName,
  takeScreenshotFromVideo,
  createThumbnailForImage,
  stringToFile,
  isFileExist,
  readJsonFile,
  objectToFileAsJson,
  mkDir,
  clearFolder
} = require("../../globals/functions")
const { pipeline } = require('stream')
const pump = util.promisify(pipeline)

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {

    const data = await request.file()
    const fields = data.fields

    const is360 = fields.is360.value

    console.log("Fields:", fields)
    //console.log("data:", data)

    const path = await createFolders(fields.session.value)
    const filePath = `${path}/${data.filename}`

    await pump(data.file, fs.createWriteStream(filePath))

    let settingsPath = `${path}/settings.json`
    if (!(await isFileExist(settingsPath))) {
      await stringToFile(settingsPath, "{}")
    }

    const settings = await readJsonFile(settingsPath)
    const c = Object.keys(settings).length
    settings[data.filename] = {
      is360 : is360 === "true",
      index: c
    }

    await objectToFileAsJson(settingsPath, settings)

    const ext = extractFileExtension(data.filename)
    switch (ext) {
      case "mp4":
        const thumb = constructThumbFileName(data.filename)
        await takeScreenshotFromVideo(filePath, path, thumb)
        break
      case "jpg":
      case "jpeg":
      case "png":
        await createThumbnailForImage(filePath)
        break
    }

    return {status: true, message: 'done'}
  })

  fastify.post('/photos360/:position/:typeOfSet', async function (request, reply) {
    const data = await request.file()
    const fields = data.fields
    const position = request.params.position
    const typeOfSet = request.params.typeOfSet
    const sessionId = fields.session.value
    const folderName = fields.folderName.value
    const hasAudio = fields.hasAudio.value === "true"
    const description = fields.description.value

    const path = `${UPLOADS_FOLDER}/${sessionId}`
    const filesDirectory = `${path}/${folderName}.${typeOfSet}`

    if (position === "start") {
      await createFolders(sessionId)
      if (!(await isFileExist(filesDirectory))) {
        mkDir(filesDirectory)
      } else {
        await clearFolder(filesDirectory)
      }

      let settingsPath = `${path}/settings.json`
      if (!(await isFileExist(settingsPath))) {
        await stringToFile(settingsPath, "{}")
      }
      const settings = await readJsonFile(settingsPath)
      const c = Object.keys(settings).length

      const mediaFullName = `${folderName}.${typeOfSet}`;
      const settingObject = settings[mediaFullName]
      if (settingObject) {
        settingObject.hasAudio = hasAudio
        settingObject.description = description
        settingObject.index = c
      } else {
        settings[mediaFullName] = {hasAudio, description, index: c}
      }

      await objectToFileAsJson(settingsPath, settings)
    }

    await pump(data.file, fs.createWriteStream(`${filesDirectory}/${data.filename}`))

    return {status: true, message: 'done'}
  })

  fastify.post('/bg-audio', async function (request, reply) {
    const data = await request.file()
    const fields = data.fields
    const sessionId = fields.session.value
    const mediaFileName = fields.mediaFileName.value

    const path = `${UPLOADS_FOLDER}/${sessionId}`

    await pump(data.file, fs.createWriteStream(`${path}/${mediaFileName}-bg-audio.mp3`))

    return {status: true, message: 'done'}
  })
}