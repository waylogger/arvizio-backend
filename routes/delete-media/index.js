"use strict"

const {UPLOADS_FOLDER} = require("../../globals/constants");
const {
  isFileExist,
  fileList,
  deleteFile,
  removeThumbnails,
  removeBackgroundAudios,
  convertFileNameToObject,
  constructThumbFileName,
  removeSettingsFromList,
  readJsonFile,
  objectToFileAsJson,
  stringToFile,
  extractFileExtension,
  abandonFileExtension,
  deleteFolder,
  removeLogoFolderFromFileList,
  legacyConstructThumbFileName
} = require("../../globals/functions");
const _ = require('lodash')

module.exports = async function (fastify) {
  fastify.post("/:id", async function (request) {
    const id = request.params.id
    const media = request.body.media
    try {
      const path = `${UPLOADS_FOLDER}/${id}`;
      const files = await fileList(path)
      removeLogoFolderFromFileList(files)
      removeThumbnails(files)
      removeSettingsFromList(files)
      removeBackgroundAudios(files)
      const ext = extractFileExtension(media)
      const fileNameWithoutExt = abandonFileExtension(media)
      switch (ext) {
        case "360":
        case "450":
          const photosList = await fileList(`${path}/${media}`)
          for (let i = 0; i < photosList.length; i++) {
            await deleteFile(`${path}/${media}/${photosList[i]}`)
          }
          await deleteFolder(`${path}/${media}`)
          break
        default:
          await deleteFile(`${path}/${media}`)
      }
      _.remove(files, (file) => (file === media))
      const thumb = constructThumbFileName(media)
      const legacyThumb = legacyConstructThumbFileName(media)
      const thumbPath = `${path}/${thumb}`
      const legacyThumbPath = `${path}/${legacyThumb}`
      const bgAudio = `${path}/${fileNameWithoutExt}-bg-audio.mp3`
      if (await isFileExist(thumbPath)) {
        await deleteFile(thumbPath)
      }
      if (await isFileExist(legacyThumbPath)) {
        await deleteFile(legacyThumbPath)
      }
      if (await isFileExist(bgAudio)) {
        await deleteFile(bgAudio)
      }
      let settingsPath = `${path}/settings.json`
      if (!(await isFileExist(settingsPath))) {
        await stringToFile(settingsPath, "{}")
      }
      const settings = await readJsonFile(settingsPath)
      delete settings[media]
      // updating indices:
      const settingsKeys = Object.keys(settings)
      let settingsArray = settingsKeys.map((key) => ({ __name__: key, ...settings[key] }))
      settingsArray = _.sortBy(settingsArray, "index")
      settingsArray.forEach((setting, index) => {
        setting.index = index
        const key = setting.__name__
        delete setting.__name__
        settings[key] = setting
      })
      // end of updating indices
      await objectToFileAsJson(settingsPath, settings)
      let gallery = []
      for (let i = 0; i < files.length; i++) {
        const filename = files[i]
        gallery.push(
          await convertFileNameToObject(filename, id, settings[filename])
        )
      }
      gallery = _.sortBy(gallery, "index")
      return {
        status  : true,
        message : "OK",
        gallery
      }
    } catch (e) {
      return {
        status: false,
        message: e.toString()
      }
    }
  })
}