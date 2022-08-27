import "./style.css";
import { sketch } from "./modules/canvas";
import { SoundGenerator } from "./modules/sound";
import { MELODYGENERATOR, MusicGenerator, NOTEPOOLS } from "./modules/musicgenerator";


// Init app HTML
document.querySelector("#app").innerHTML = `
  <div>
    <h3>music-of-decay</h3>
    <div class="card">
	  <button id="btn_pause" type="button">Pause</button>
    </div>
	<div>
		<div>
			<select id="sel_notepool">
			</select>
		</div>
		<div>
			<select id="sel_melodygenerator">
			</select>
		</div>
		<div>
			<select id="sel_instrument">
				<option value="Grand Piano">Grand Piano</option>
				<option value="Chorus female">Chorus female</option>
				<option value="Tremulo">Tremulo</option>
			</select>
		</div>
		<div>
			<select id="sel_convolver">
				<option value="">- None -</option>
				<option value="RoomMedium">Medium room</option>
				<option value="AirportTerminal">Airport Terminal</option>
			</select>
		</div>
		<div>
			<label for="rng_gain">Gain:</label>
			<input type="range" id="rng_gain" min="0" max="2" value="0.7" step="0.01">
		</div>
		<div>
			<label for="rng_fade">Fade time:</label>
			<input type="range" id="rng_fade" min="0" max="2" value="0.7" step="0.1">
		</div>
	</div>
    <div id="p5-container"></div>
  </div>
`;

// Init P5 canvas
const containerElement = document.getElementById("p5-container");
// eslint-disable-next-line no-undef
const canvas = new p5(sketch, containerElement);

// Init sound and music generator
const soundGenerator = new SoundGenerator();
const musicGenerator = new MusicGenerator(soundGenerator);



let socket = new WebSocket("ws://diskstation:1881/ws/decay");

socket.onopen = function () {
	console.log("[open] Connection established");
	console.log("Sending to server");
};

socket.onclose = function (event) {
	if (event.wasClean) {
		console.log(
			`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
		);
	} else {
		// e.g. server process killed or network down
		// event.code is usually 1006 in this case
		console.log("[close] Connection died");
	}
};

socket.onerror = function (error) {
	console.log(`[error] ${error.message}`);
};



(async () => {
	let isPlaying = false;

	const playNote = () => {
		musicGenerator.playNextNote();
	};

	const startPlay = () => {
		isPlaying = true;

		socket.onmessage = function (event) {
			console.log(`[message] Data received from server: ${event.data}`);

			if (isPlaying) {
				playNote();
				canvas.addDecayParticle();
			}
		};
	};

	for (const key in NOTEPOOLS) {
		const notepool = NOTEPOOLS[key];
		var option_notepool = document.createElement("option");
		option_notepool.text = notepool.title;
		option_notepool.value = key;
		document.getElementById("sel_notepool").add(option_notepool);
	}

	document.getElementById("sel_notepool").addEventListener("change", e => {
		console.log("Set notepool to:", e.target.value);
		musicGenerator.setNotepool(e.target.value);
	});

	for (const key in MELODYGENERATOR) {
		const melodygenerator = MELODYGENERATOR[key];
		var option_melodygenerator = document.createElement("option");
		option_melodygenerator.text = melodygenerator.title;
		option_melodygenerator.value = key;
		document.getElementById("sel_melodygenerator").add(option_melodygenerator);
	}

	document.getElementById("sel_melodygenerator").addEventListener("change", e => {
		console.log("Set melody generator to:", e.target.value);
		musicGenerator.setMelodygenerator(e.target.value);
	});

	document.getElementById("sel_instrument").addEventListener("change", e => {
		console.log("Set intrument to:", e.target.value);
		soundGenerator.setInstrument(e.target.value);
	});

	document.getElementById("sel_convolver").addEventListener("change", e => {
		console.log("Set convolver to:", e.target.value);
		soundGenerator.setConvolver(e.target.value);
	});

	document.getElementById("rng_gain").addEventListener("input", e => {
		console.log("Set gain to:", e.target.value);
		soundGenerator.setGain(e.target.value);
	});

	document.getElementById("rng_fade").addEventListener("input", e => {
		console.log("Set fade to:", e.target.value);
		soundGenerator.setFade(e.target.value);
	});

	document.getElementById("btn_pause").addEventListener("click", () => {
		isPlaying = false;
		canvas.pause();
	});

	containerElement.addEventListener("clickPlay", () => {
		startPlay();
	});

	containerElement.addEventListener("clickCanvas", () => {
		playNote();
	});
})();
