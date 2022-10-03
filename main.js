import "./style.css";
import { sketch } from "./modules/canvas";
import { SoundGenerator } from "./modules/sound";
import { MELODYGENERATOR, MusicGenerator, NOTEPOOLS } from "./modules/musicgenerator";

console.log("%cPackage: __CLI_NAME__, version: __CLI_VERSION__, date: __CLI_TS__", "background-color: #36a5b7; color: #FFF;");

// Init app HTML
document.querySelector("#app").innerHTML = `
<div>
	<div id="header">
		<div class="header_segment">
			<div class="header_logo">Sounds of decay</div>
			<div>__CLI_VERSION__</div>
		</div>
		<div class="header_segment">
			<div class="header_label">Note pool:</div>
			<div class="header_control"><select id="sel_notepool"></select></div>
		</div>
		<div class="header_segment">
			<div class="header_label">Melody generator:</div>
			<div class="header_control"><select id="sel_melodygenerator"></select></div>
		</div>
		<div class="header_segment">
			<div class="header_label">Intrument:</div>
			<div class="header_control">
				<select id="sel_instrument">
					<option value="Grand Piano">Grand Piano</option>
					<option value="Chorus female">Chorus female</option>
					<option value="Chorus male">Chorus male</option>
					<option value="Violin Tremulo">Violin Tremulo</option>
					<option value="Cello Tremulo">Cello Tremulo</option>
					<option value="Xylophone">Xylophone</option>
				</select>
			</div>
		</div>
		<div class="header_segment">
			<div class="header_label">Effects/convolver:</div>
			<div class="header_control">
				<select id="sel_convolver">
					<option value="">- None -</option>
					<option value="RoomMedium">Medium room</option>
					<option value="AirportTerminal">Airport Terminal</option>
				</select>
			</div>
		</div>
		<div class="header_segment">
			<div class="header_label">Gain:</div>
			<div class="header_control"><input type="range" id="rng_gain" min="0" max="2" value="0.7" step="0.01"></div>
		</div>
		<div class="header_segment">
			<div class="header_label">Fade time:</div>
			<div class="header_control"><input type="range" id="rng_fade" min="0" max="2" value="0.7" step="0.1"></div>
		</div>
	</div>

	<div id="p5-container"></div>

	<div id="footer">
		<div>More informations: <a href="https://github.com/toblum/sounds-of-decay" target="_blank">https://github.com/toblum/sounds-of-decay</a></div>
	</div>
</div>`;

// Init P5 canvas
const containerElement = document.getElementById("p5-container");
// eslint-disable-next-line no-undef
const canvas = new p5(sketch, containerElement);

// Init sound and music generator
const soundGenerator = new SoundGenerator();
const musicGenerator = new MusicGenerator(soundGenerator);



let socket = new WebSocket("wss://decayrelay.tobiasblum.de");

socket.onopen = function () {
	console.log("[open] Connection established");
};

socket.onclose = function (event) {
	if (event.wasClean) {
		console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
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

	const startPlaying = () => {
		isPlaying = true;

	};
	socket.onmessage = function (event) {
		// console.log(`[message] Data received from server: ${event.data}`);

		if (isPlaying && event.data === "Decay") {
			playNote();
		}
		canvas.addDecayParticle();
	};

	const pausePlaying = () => {
		isPlaying = false;
		canvas.pause();
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

	containerElement.addEventListener("clickPlay", () => {
		startPlaying();
	});

	containerElement.addEventListener("clickPause", () => {
		pausePlaying();
	});

	containerElement.addEventListener("clickCanvas", () => {
		playNote();
	});
})();
