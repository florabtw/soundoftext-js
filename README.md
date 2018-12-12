# soundoftext-js

A NodeJS library for the [SoundOfText API](https://soundoftext.com/docs).

## Install

Install with **npm**:

```
npm install soundoftext-js
```

or **yarn**:

```
yarn add soundoftext-js
```

## Usage

This library supports four operations: `create`, `location`, `request`, and `status`.

You will **most likely** want to use `create`, as it has the simplest interface.

### sounds.create

This function requests for a sound to be created, and polls the API until the sound is finished being created, eventually returning
a URL that links to an MP3 file.

This function takes an object with two properties:

- text - the text to be spoken
- voice - the voice (language + accent) to use.

and returns the url for an MP3 file that you could then download.

```js
const client = require('soundoftext-js');

client.sounds.create({ text:'Hello, world!', voice: 'en-US' })
  .then(soundUrl => {
    console.log(soundUrl); // https://soundoftext.nyc3.digitaloceanspaces.com/<sound-id>.mp3
  })
  .catch(e => {
    /* Reasons that the Promise might get rejected:
     * - after 60 seconds, it automatically times out
     * - the API might fail to create the sound or reject it
     * - other miscellaneous network issues
     */
  });
```

### sounds.request

This function requests for a sound to be created, and returns an object containing the sound id.

This function takes an object with two properties:

- text - the text to be spoken
- voice - the voice (language + accent) to use

and returns an object containing the sound id.

```js
const client = require('soundoftext-js');

client.sounds.request({ text: 'Hello, world!', voice: 'en-US' })
  .then(response => {
    console.log(response);
    /* One of:
     * { success: true, id: '<sound-id>' }
     * { success: false, message: '<error-message>' }
     */
  })
  .catch(e => {
    /* Reasons that the Promise might get rejected:
     * - API rejects the request
     * - other miscellaneous network issues
     */
  });
```

### sounds.status

This function takes a sound id and returns the current status.

This function takes an object with one property:

- id - the id for the sound

and returns an object containing the status of the sound.

```js
const client = require('soundoftext-js');

client.sounds.request({ text: 'Hello, world!', voice: 'en-US' })
  .then(response => {
    return client.sounds.status({ id: response.id });
  })
  .then(status => {
    console.log(status);
    /* One of:
     * { status: 'Error', message: '<error-message>' }
     * { status: 'Pending' }
     * { status: 'Done', location: '<url-for-mp3-file>' }
     */
  })
  .catch(e => {
    /* Reasons that the Promise might get rejected:
     * - API rejects the request
     * - other miscellaneous network issues
     */
  });
```

### sounds.location

This is a convenience wrapper for `sounds.status`, which starts polling regularly for the status to be 'Done', before returning
the url for the mp3 file. It rejects the promise if it times out (~60 seconds) or if the API returns an 'Error' status.

This function takes an object with one property:

- id - the id for the sound

and returns the url for the MP3 file.

```js
const client = require('soundoftext-js');

client.sounds.request({ text: 'Hello, world!', voice: 'en-US' })
  .then(response => {
    return client.sounds.location({ id: response.id });
  })
  .then(location => {
    console.log(location); // https://soundoftext.nyc3.digitaloceanspaces.com/<sound-id>.mp3
  })
  .catch(e => {
    /* Reasons that the Promise might get rejected:
     * - after 60 seconds, it automatically times out
     * - the API might fail to create the sound or reject it
     * - other miscellaneous network issues
     */
  });
```

## FAQ

**What voices does this support?**

You can find a list of language codes in the [documentation for Sound of Text](https://soundoftext.com/docs#voices).

You could also use another package of mine called [google-tts-langauges](https://github.com/ncpierson/google-tts-languages)
that is another JS library that exports all the language codes.
