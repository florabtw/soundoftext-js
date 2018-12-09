const test = require('ava'),
  nock = require('nock'),
  client = require('./src');

const sounds = client.sounds;

const bodies = {
  request: (engine = 'Google', text, voice) =>
    JSON.stringify({engine, data: {text, voice}}),
};

const mockRequest = (text, voice, url = 'https://api.soundoftext.com') => {
  const expectedBody = bodies.request(text, voice);
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

const mockLocation = id => {
  nock('https://api.soundoftext.com')
    .get(`/sounds/${id}`)
    .reply(200, {status: 'Pending'})
    .get(`/sounds/${id}`)
    .reply(200, {status: 'Done', location: 'location'});

  return 'location';
};

test.beforeEach(() => {
  client.configure({api: 'https://api.soundoftext.com'});
});

test('can request sounds', async t => {
  const response = mockRequest('hello', 'en-US');

  const body = await sounds.request({text: 'hello', voice: 'en-US'});

  t.deepEqual(response, body);
});

test.serial('can configure api host', async t => {
  const response = mockRequest('hello', 'en-US', 'http://fakeapi.com');

  client.configure({api: 'http://fakeapi.com'});

  const body = await sounds.request({text: 'hello', voice: 'en-US'});

  t.deepEqual(response, body);
});

test('can get sound status', async t => {
  const requestRes = mockRequest('hello', 'en-US');
  const statusRes = mockStatus(requestRes.id);

  await sounds.request({text: 'hello', voice: 'en-US'});
  const body = await sounds.status({id: requestRes.id});

  t.deepEqual(body, statusRes);
});

test('can get sound location', async t => {
  const requestRes = mockRequest('hello', 'en-US');
  const locationRes = mockLocation(requestRes.id);

  await sounds.request({text: 'hello', voice: 'en-US'});
  const body = await sounds.location({id: requestRes.id});

  t.is(locationRes, body);
});
