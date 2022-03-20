"use strict"

const {UPLOADS_FOLDER, FILES_PREFIX} = require("../../globals/constants");
const {fileList, sortPictures, removeLogoFolderFromFileList} = require("../../globals/functions");

module.exports = async function (fastify) {
  fastify.get("/:id", async function (request) {
    const id = request.params.id
    try {
      const files = await fileList(`${UPLOADS_FOLDER}/${id}`)
      removeLogoFolderFromFileList(files)
      sortPictures(files)
      const firstFile = files[0].indexOf("pic") === 0 ? files[0] : null //files.find(it => (it.indexOf("pic1") === 0))
      return {
        status  : !!firstFile,
        message : !firstFile ? `There are no pictures for specified id. id: ${id}` : "OK",
        pic     : firstFile ? `${FILES_PREFIX}${id}/${firstFile}` : undefined
      }
    } catch (e) {
      return {
        status: false,
        message: e.toString()
      }
    }
  })
}