'use strict'

const fs = require('fs')
const util = require('util')
const {createFolders, fileList, sortPictures, removeLogoFolderFromFileList} = require("../../globals/functions");
const { pipeline } = require('stream')
const pump = util.promisify(pipeline)

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {

    const data = await request.file()
    const fields = data.fields

    console.log("Fields:", fields)

    const path = await createFolders(fields.session.value)

    const files = await fileList(path)
    removeLogoFolderFromFileList(files)
    const filtered = files.filter(fn => (fn.indexOf("pic") === 0) )
    sortPictures(filtered)
    const indexes = filtered.map(it => (it.match(/\d+/g)[0] - 0) )
    let firstGap = indexes.length > 0 ? indexes[indexes.length - 1] + 1 : 1
    for (let i = 0; i < indexes.length - 1; i++) {
      if (i === 0 && indexes[0] > 1) {
        firstGap = 1
        break
      }
      if (indexes[i + 1] - indexes[i] > 1) {
        firstGap = indexes[i] + 1
        break
      }
    }
    const filenameSegments = fields.myFile.filename.split('.')
    const fileExtension = filenameSegments[filenameSegments.length - 1]

    await pump(data.file, fs.createWriteStream(`${path}/pic${firstGap}.${fileExtension}`))

    return {status: true, message: 'done'}
  })
}