'use strict'

const fs = require('fs')
const util = require('util')
const {UPLOADS_FOLDER} = require("../../globals/constants.js");
const {mkDir} = require("../../globals/functions");
const { pipeline } = require('stream')
const pump = util.promisify(pipeline)

module.exports = async function (fastify, opts) {
  fastify.post('/:projectName', async function (request, reply) {

    const projectName = request.params['projectName']
    const data = await request.file()
    const logoFolder = `${UPLOADS_FOLDER}/${projectName}/project.logo`

    mkDir(logoFolder)

    await pump(data.file, fs.createWriteStream(`${logoFolder}/${data.filename}`))

    return {status: true, message: 'done'}
  })
}