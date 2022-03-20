"use strict"

const {UPLOADS_FOLDER, FILES_PREFIX} = require("../../globals/constants");
const {fileList, isFileExist} = require("../../globals/functions");

module.exports = async function (fastify) {
  fastify.get("/:id", async function (request) {
    const id = request.params.id
    const logoFolderPath = `${UPLOADS_FOLDER}/${id}/project.logo`;
    let fileName = null
    if (await isFileExist(logoFolderPath)) {
      const files = await fileList(logoFolderPath)
      if (files.length > 0) {
        fileName = files[0]
      }
    }
    return {
      status: true,
      fileName
    }
  })
}