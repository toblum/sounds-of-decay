import './style.css';
import { sketch } from './modules/canvas';


// Init app HTML
document.querySelector('#app').innerHTML = `
  <div>
    <h1>music-of-decay</h1>
    <div class="card">
      <button id="btn_play" type="button">Play</button>
	  <button id="btn_stop" type="button">Stop</button>
    </div>
    <div id="p5-container"></div>
  </div>
`;

// Init P5 canvas
const containerElement = document.getElementById('p5-container');
const canvas = new p5(sketch, containerElement);



const SAMPLE_LIBRARY = {
	'Grand Piano': [
		{ note: 'A', octave: 4, file: 'samples/Grand Piano/piano-f-a4.wav' },
		{ note: 'A', octave: 5, file: 'samples/Grand Piano/piano-f-a5.wav' },
		{ note: 'A', octave: 6, file: 'samples/Grand Piano/piano-f-a6.wav' },
		{ note: 'C', octave: 4, file: 'samples/Grand Piano/piano-f-c4.wav' },
		{ note: 'C', octave: 5, file: 'samples/Grand Piano/piano-f-c5.wav' },
		{ note: 'C', octave: 6, file: 'samples/Grand Piano/piano-f-c6.wav' },
		{ note: 'D#', octave: 4, file: 'samples/Grand Piano/piano-f-d#4.wav' },
		{ note: 'D#', octave: 5, file: 'samples/Grand Piano/piano-f-d#5.wav' },
		{ note: 'D#', octave: 6, file: 'samples/Grand Piano/piano-f-d#6.wav' },
		{ note: 'F#', octave: 4, file: 'samples/Grand Piano/piano-f-f#4.wav' },
		{ note: 'F#', octave: 5, file: 'samples/Grand Piano/piano-f-f#5.wav' },
		{ note: 'F#', octave: 6, file: 'samples/Grand Piano/piano-f-f#6.wav' },
	],
	'Chorus female': [
		{ note: 'A', octave: 4, file: 'samples/Chorus/chorus-female-a4-PB-loop.wav' },
		{ note: 'A#', octave: 4, file: 'samples/Chorus/chorus-female-a#4-PB-loop.wav' },
		{ note: 'A', octave: 5, file: 'samples/Chorus/chorus-female-a5-PB-loop.wav' },
		{ note: 'A#', octave: 5, file: 'samples/Chorus/chorus-female-a#5-PB-loop.wav' },
		{ note: 'B', octave: 4, file: 'samples/Chorus/chorus-female-b4-PB-loop.wav' },
		{ note: 'B', octave: 5, file: 'samples/Chorus/chorus-female-b5-PB-loop.wav' },
		{ note: 'C', octave: 5, file: 'samples/Chorus/chorus-female-c5-PB-loop.wav' },
		{ note: 'C#', octave: 5, file: 'samples/Chorus/chorus-female-c#5-PB-loop.wav' },
		{ note: 'C', octave: 6, file: 'samples/Chorus/chorus-female-c6-PB-loop.wav' },
		{ note: 'D', octave: 5, file: 'samples/Chorus/chorus-female-d5-PB-loop.wav' },
		{ note: 'D#', octave: 5, file: 'samples/Chorus/chorus-female-d#5-PB-loop.wav' },
		{ note: 'E', octave: 5, file: 'samples/Chorus/chorus-female-e5-PB-loop.wav' },
		{ note: 'F', octave: 5, file: 'samples/Chorus/chorus-female-f5-PB-loop.wav' },
		{ note: 'F#', octave: 5, file: 'samples/Chorus/chorus-female-f#5-PB-loop.wav' },
		{ note: 'G', octave: 4, file: 'samples/Chorus/chorus-female-g4-PB-loop.wav' },
		{ note: 'G', octave: 5, file: 'samples/Chorus/chorus-female-g5-PB-loop.wav' },
		{ note: 'G#', octave: 4, file: 'samples/Chorus/chorus-female-g#4-PB-loop.wav' },
		{ note: 'G#', octave: 5, file: 'samples/Chorus/chorus-female-g#5-PB-loop.wav' },
	],
	'Tremulo': [
		{ note: 'A#', octave: 3, file: 'samples/Tremulo/3_Bb.wav' },
		{ note: 'G', octave: 3, file: 'samples/Tremulo/3_G.wav' },
		{ note: 'A#', octave: 4, file: 'samples/Tremulo/4_Bb.wav' },
		{ note: 'C#', octave: 4, file: 'samples/Tremulo/4_Db.wav' },
		{ note: 'G', octave: 4, file: 'samples/Tremulo/4_G.wav' },
		{ note: 'B', octave: 5, file: 'samples/Tremulo/5_B.wav' },
		{ note: 'C#', octave: 5, file: 'samples/Tremulo/5_Db.wav' },
		{ note: 'E', octave: 5, file: 'samples/Tremulo/5_E.wav' },
		{ note: 'G', octave: 5, file: 'samples/Tremulo/5_G.wav' },
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

function playSampleWithConvolver(instrument, note, destination, delaySeconds = 0) {
	getSample(instrument, note).then(({ audioBuffer, distance }) => {
		let playbackRate = Math.pow(2, distance / 12);
		let bufferSource = audioContext.createBufferSource();

		bufferSource.buffer = audioBuffer;
		bufferSource.playbackRate.value = playbackRate;

		bufferSource.connect(destination);
		bufferSource.start(audioContext.currentTime + delaySeconds);
	});
}






let socket = new WebSocket('ws://diskstation:1881/ws/decay');

socket.onopen = function (e) {
	console.log('[open] Connection established');
	console.log('Sending to server');
};

// socket.onmessage = function (event) {
// 	console.log(`[message] Data received from server: ${event.data}`);
// };

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



// https://teropa.info/blog/2016/07/28/javascript-systems-music.html#brian-enoambient-1-music-for-airports-2-11978
const musicalNotes = ['F4', 'Ab4', 'C5', 'Db5', 'Eb5', 'F5', 'Ab5'];


// Instruments: https://github.com/peastman/sso
// Reverb from: https://www.airwindows.com/airwindows-impulses/
fetchSample('samples/RoomMedium.wav').then(convolverBuffer => {
	let convolver = audioContext.createConvolver();
	convolver.buffer = convolverBuffer;
	convolver.connect(audioContext.destination);
	console.log("Convolver connected");

	document.getElementById("btn_play").addEventListener("click", e => {
		audioContext.resume();

		socket.onmessage = function (event) {
			console.log(`[message] Data received from server: ${event.data}`);

			var musicalNote = musicalNotes[Math.floor(Math.random() * musicalNotes.length)];
			playSample('Grand Piano', musicalNote);
			// playSampleWithConvolver('Grand Piano', musicalNote, convolver);
			// playSample('Chorus female', musicalNote);
			// playSampleWithConvolver('Chorus female', musicalNote, convolver);
			// playSample('Tremulo', musicalNote);

			canvas.addDecayParticle();
		};
	});

	document.getElementById("btn_stop").addEventListener("click", e => {
		audioContext.suspend();
	});
});

