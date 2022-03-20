"use strict"

const {UPLOADS_FOLDER, FILES_PREFIX} = require("../../globals/constants");
const _ = require('lodash');
const {
  fileList,
  removeThumbnails,
  convertFileNameToObject,
  removeSettingsFromList,
  removeBackgroundAudios,
  readJsonFile,
  isFileExist,
  stringToFile,
  removeLogoFolderFromFileList
} = require("../../globals/functions");

module.exports = async function (fastify) {
  fastify.get("/:id", async function (request) {
    const id = request.params.id
    try {
      const dir = `${UPLOADS_FOLDER}/${id}`;
      const files = await fileList(dir)
      removeLogoFolderFromFileList(files)
      removeThumbnails(files)
      removeSettingsFromList(files)
      removeBackgroundAudios(files)
      let settingsPath = `${dir}/settings.json`
      if (!(await isFileExist(settingsPath))) {
        await stringToFile(settingsPath, "{}")
      }
      const settings = await readJsonFile(`${dir}/settings.json`)
      files.forEach((file) => {
        if (!settings[file]) {
          settings[file] = {}
        }
      })
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