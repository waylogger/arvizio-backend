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
      return {
        status  : true,
        message : "OK",
        gallery : files.map(filename => (`${FILES_PREFIX}${id}/${filename}`))
      }
    } catch (e) {
      return {
        status: false,
        message: e.toString()
      }
    }
  })
}