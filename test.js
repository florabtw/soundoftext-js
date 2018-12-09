const test = require('ava'),
  nock = require('nock'),
  client = require('./src');

const sounds = client.sounds;

const bodies = {
  create: (engine = 'Google', text, voice) =>
    JSON.stringify({engine, data: {text, voice}}),
};

const mockCreate = (text, voice, url = 'https://api.soundoftext.com') => {
  const expectedBody = bodies.create(text, voice);
  const mockResponse = {success: true, id: 1};

  nock(url)
    .post('/sounds', expectedBody)
    .reply(200, mockResponse);

  return mockResponse;
};

const mockStatus = id => {
  const mockResponse = {status: 'DONE', location: 'fakelocation'};

  nock('https://api.soundoftext.com')
    .get(`/sounds/${id}`)
    .reply(200, mockResponse);

  return mockResponse;
};

test.beforeEach(() => {
  client.configure({api: 'https://api.soundoftext.com'});
});

test('can create sounds', async t => {
  const response = mockCreate('hello', 'en-US');

  const body = await sounds.create({text: 'hello', voice: 'en-US'});

  t.deepEqual(response, body);
});

test.serial('can configure api host', async t => {
  const response = mockCreate('hello', 'en-US', 'http://fakeapi.com');

  client.configure({api: 'http://fakeapi.com'});

  const body = await sounds.create({text: 'hello', voice: 'en-US'});

  t.deepEqual(response, body);
});

test('can get sound status', async t => {
  const createRes = mockCreate('hello', 'en-US');
  const statusRes = mockStatus(createRes.id);

  await sounds.create({text: 'hello', voice: 'en-US'});
  const body = await sounds.status({id: createRes.id});

  t.deepEqual(body, statusRes);
});
