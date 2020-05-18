const fastify = require('fastify')();
const { v4: uuidv4 } = require('uuid');
const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);


client.on("error", function (error) {
  console.error(error);
});

fastify.get('/aa/get/:uuid', async (request, reply) => {
  const params = request.params;
  if (params && params.uuid) {
    const aa = await getAsync(params.uuid);
    if (!aa) {
      return { err: 'not found' };
    }
    return aa;
  } else {
    return { err: 'incorrect request' }
  }
});

fastify.post('/aa/add', async (request, reply) => {
  const body = request.body;
  if (body && body.aa) {
    const uuid = uuidv4();
    const result = await setAsync(uuid, body.aa, 'EX', 60 * 5);
    if (result !== 'OK') return { err: 'error try again later' }
    return { ok: true, url: 'https://olabs.org/aa/get/' + uuid };
  } else {
    return { err: 'incorrect request' };
  }
});

(async () => {
  try {
    await fastify.listen(3001);
  }
  catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
