const http = require('http');
const https = require('https');

let client = https;

let options = {
  default: {
    headers: {'Content-Type': 'application/json'},
    hostname: 'api.soundoftext.com',
  },
  create: () => ({...options.default, method: 'POST', path: '/sounds'}),
  status: id => ({...options.default, method: 'GET', path: `/sounds/${id}`}),
};

const bodies = {
  create: (engine = 'Google', text, voice) =>
    JSON.stringify({engine, data: {text, voice}}),
};

const configure = ({api}) => {
  const [protocol, hostname] = api.split('://');

  options = {...options, default: {...options.default, hostname}};
  client = protocol == 'https' ? https : http;
};

const request = (options, body) => {
  return new Promise((resolve, reject) => {
    const request = client.request(options, res => {
      let data = '';
      res.on('data', chunk => (data = data + chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    });
    request.setTimeout(10 * 1000);
    if (body) request.write(body);
    request.on('error', reject);
    request.end();
  });
};

const operations = {
  create: ({text, voice}) =>
    request(options.create(), bodies.create(text, voice)),
  status: ({id}) => request(options.status(id)),
};

const retry = (func, timeout) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(func()), timeout);
  });
};

const location = ({id, timeout = 1000}) => {
  return operations.status({id}).then(res => {
    if (res.status == 'Error') throw res.message;
    if (timeout > 30 * 1000) throw 'Operation timed out';
    if (res.status == 'Pending') {
      return retry(() => location({id, timeout: timeout * 2}), timeout);
    }

    return res.location;
  });
};

const soundoftext = {
  configure,
  sounds: {
    create: operations.create,
    status: operations.status,
    location,
  },
};

module.exports = soundoftext;
