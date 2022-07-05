import './style.css';
import { sketch } from './modules/canvas';
import { SoundGenerator } from './modules/sound';


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

// Init sound generator
const soundGenerator = new SoundGenerator();




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




(async () => {
	const convolver = await soundGenerator.loadConvolver('samples/RoomMedium.wav');
	console.log("+++");

	document.getElementById("btn_play").addEventListener("click", e => {
		soundGenerator.resume();

		socket.onmessage = function (event) {
			console.log(`[message] Data received from server: ${event.data}`);

			var musicalNote = musicalNotes[Math.floor(Math.random() * musicalNotes.length)];
			// soundsGenerator.playSample('Grand Piano', musicalNote);
			soundGenerator.playSampleWithConvolver('Grand Piano', musicalNote, convolver);
			// soundsGenerator.playSample('Chorus female', musicalNote);
			// soundsGenerator.playSampleWithConvolver('Chorus female', musicalNote, convolver);
			// soundsGenerator.playSample('Tremulo', musicalNote);

			canvas.addDecayParticle();
		};
	});

	document.getElementById("btn_stop").addEventListener("click", e => {
		soundGenerator.suspend();
	});
})();


