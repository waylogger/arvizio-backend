'use strict'

const {createFolders, stringToFile} = require("../../globals/functions");

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {

    let data = await request.body
    data = JSON.stringify(data)
    const sessionId = request.headers.session

    const path = await createFolders(sessionId)

    await stringToFile(`${path}/space.json`, data)

    return {status: true, message: 'done'}
  })
}