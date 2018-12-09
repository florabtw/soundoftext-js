const test = require('ava'),
  nock = require('nock'),
  client = require('./src');

const bodies = {
  create: (engine = 'Google', text, voice) =>
    JSON.stringify({engine, data: {text, voice}}),
};

const mockCreate = (text, voice) => {
  const expectedBody = bodies.create(text, voice);
  const mockResponse = {data: 'data'};

  nock('https://api.soundoftext.com')
    .post('/sounds', expectedBody)
    .reply(200, mockResponse);

  return mockResponse;
};

test('can create sounds', async t => {
  const response = mockCreate('hello', 'en-US');

  const body = await client.sounds.create({
    text: 'hello',
    voice: 'en-US',
  });

  t.deepEqual(response, body);
});
