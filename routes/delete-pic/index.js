"use strict"

const {UPLOADS_FOLDER, FILES_PREFIX} = require("../../globals/constants");
const {fileList, deleteFile, sortPictures, removeLogoFolderFromFileList} = require("../../globals/functions");
const _ = require('lodash/array')

module.exports = async function (fastify) {
  fastify.delete("/:id/:pic", async function (request) {
    const id = request.params.id
    const pic = request.params.pic
    try {
      const files = await fileList(`${UPLOADS_FOLDER}/${id}`)
      removeLogoFolderFromFileList(files)
      sortPictures(files)
      _.remove(files, (file) => (file === pic))
      await deleteFile(`${UPLOADS_FOLDER}/${id}/${pic}`)
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