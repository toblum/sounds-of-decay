import './style.css';
import viteLogo from '/vite.svg';
import javascriptLogo from './javascript.svg';

const SAMPLE_LIBRARY = {
  'Grand Piano': [
    { note: 'A', octave: 4, file: 'Samples/Grand Piano/piano-f-a4.wav' },
    { note: 'A', octave: 5, file: 'Samples/Grand Piano/piano-f-a5.wav' },
    { note: 'A', octave: 6, file: 'Samples/Grand Piano/piano-f-a6.wav' },
    { note: 'C', octave: 4, file: 'Samples/Grand Piano/piano-f-c4.wav' },
    { note: 'C', octave: 5, file: 'Samples/Grand Piano/piano-f-c5.wav' },
    { note: 'C', octave: 6, file: 'Samples/Grand Piano/piano-f-c6.wav' },
    { note: 'D#', octave: 4, file: 'Samples/Grand Piano/piano-f-d#4.wav' },
    { note: 'D#', octave: 5, file: 'Samples/Grand Piano/piano-f-d#5.wav' },
    { note: 'D#', octave: 6, file: 'Samples/Grand Piano/piano-f-d#6.wav' },
    { note: 'F#', octave: 4, file: 'Samples/Grand Piano/piano-f-f#4.wav' },
    { note: 'F#', octave: 5, file: 'Samples/Grand Piano/piano-f-f#5.wav' },
    { note: 'F#', octave: 6, file: 'Samples/Grand Piano/piano-f-f#6.wav' },
  ],
};
const OCTAVE = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

let audioContext = new AudioContext();

function fetchSample(path) {
  return fetch(encodeURIComponent(path))
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));
}

function noteValue(note, octave) {
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank, note, octave) {
  let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
    let distanceToA = Math.abs(
      getNoteDistance(note, octave, sampleA.note, sampleA.octave)
    );
    let distanceToB = Math.abs(
      getNoteDistance(note, octave, sampleB.note, sampleB.octave)
    );
    return distanceToA - distanceToB;
  });
  return sortedBank[0];
}

function flatToSharp(note) {
  switch (note) {
    case 'Bb':
      return 'A#';
    case 'Db':
      return 'C#';
    case 'Eb':
      return 'D#';
    case 'Gb':
      return 'F#';
    case 'Ab':
      return 'G#';
    default:
      return note;
  }
}

function getSample(instrument, noteAndOctave) {
  let [, requestedNote, requestedOctave] = /^(\w[b\#]?)(\d)$/.exec(
    noteAndOctave
  );
  requestedOctave = parseInt(requestedOctave, 10);
  requestedNote = flatToSharp(requestedNote);
  let sampleBank = SAMPLE_LIBRARY[instrument];
  let sample = getNearestSample(sampleBank, requestedNote, requestedOctave);
  let distance = getNoteDistance(
    requestedNote,
    requestedOctave,
    sample.note,
    sample.octave
  );
  return fetchSample(sample.file).then((audioBuffer) => ({
    audioBuffer: audioBuffer,
    distance: distance,
  }));
}

function playSample(instrument, note) {
  getSample(instrument, note).then(({ audioBuffer, distance }) => {
    let playbackRate = Math.pow(2, distance / 12);
    let bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.playbackRate.value = playbackRate;
    bufferSource.connect(audioContext.destination);
    bufferSource.start();
  });
}

// Temporary test code
setTimeout(() => playSample('Grand Piano', 'F4'), 1000);
setTimeout(() => playSample('Grand Piano', 'Ab4'), 2000);
setTimeout(() => playSample('Grand Piano', 'C5'), 3000);
setTimeout(() => playSample('Grand Piano', 'Db5'), 4000);
setTimeout(() => playSample('Grand Piano', 'Eb5'), 5000);
setTimeout(() => playSample('Grand Piano', 'F5'), 6000);
setTimeout(() => playSample('Grand Piano', 'Ab5'), 7000);

let socket = new WebSocket('ws://diskstation:1881/ws/decay');

socket.onopen = function (e) {
  console.log('[open] Connection established');
  console.log('Sending to server');
};

socket.onmessage = function (event) {
  console.log(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    );
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died');
  }
};

socket.onerror = function (error) {
  console.log(`[error] ${error.message}`);
};

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`;
