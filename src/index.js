const http = require('http');
const https = require('https');

let client = https;

let options = {
  default: {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SoundOfTextClient',
    },
    hostname: 'api.soundoftext.com',
  },
  request: () => ({...options.default, method: 'POST', path: '/sounds'}),
  status: id => ({...options.default, method: 'GET', path: `/sounds/${id}`}),
};

const bodies = {
  request: ({engine = 'Google', text, voice}) =>
    JSON.stringify({engine, data: {text, voice}}),
};

const configure = ({api}) => {
  const [protocol, hostname] = api.split('://');

  options = {...options, default: {...options.default, hostname}};
  client = protocol == 'https' ? https : http;
};

const request = (options, body) =>
  new Promise((resolve, reject) => {
    const request = client.request(options, res => {
      let data = '';
      res.on('data', chunk => (data = data + chunk));
      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.message) reject(response.message);
        else resolve(response);
      });
    });
    request.setTimeout(10 * 1000);
    if (body) request.write(body);
    request.on('error', reject);
    request.end();
  });

const retry = (func, timeout) =>
  new Promise(resolve => setTimeout(() => resolve(func()), timeout));

const location = ({id, timeout = 1000}) =>
  operations.status({id}).then(res => {
    if (res.status == 'Error') throw res.message;
    if (res.status == 'Done') return res.location;
    if (timeout > 30 * 1000) throw 'Operation timed out';

    return retry(() => location({id, timeout: timeout * 2}), timeout);
  });

const create = request => operations.request(request).then(operations.location);

const operations = {
  create,
  location,
  request: ({text, voice}) =>
    request(options.request(), bodies.request({text, voice})),
  status: ({id}) => request(options.status(id)),
};

module.exports = {configure, sounds: operations};
