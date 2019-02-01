const createProbot = require('probot-ts')
const { bot } = require('./dist')
const zlib = require('zlib'); // for GZIP
const http = require('http');
const https = require('https');
const settings = require('./env.json')
process.env.APP_NAME = 'ci-reporter'

const probot = createProbot(settings)

probot.load(bot)

/**
 * Relay GitHub events to the bot
 */
exports.bot = (request, response) => {
  const event = request.get('x-github-event') || request.get('X-GitHub-Event')
  console.log(event);
  const id = request.get('x-github-delivery') || request.get('X-GitHub-Delivery')
  console.log(`Received event ${event}${request.body.action ? ('.' + request.body.action) : ''}`)
  if (event) {
    try {
      probot.receive({
        event: event,
        id: id,
        payload: request.body
      }).then(() => {
        response.send({
          statusCode: 200,
          body: JSON.stringify({
            message: 'Executed'
          })
        })
      })
    } catch (err) {
      console.error(err)
      response.sendStatus(500)
    }
  } else {
    console.error(request)
    response.sendStatus(400)
  }
}
