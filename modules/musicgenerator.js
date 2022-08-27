// Functions to generate music
// Based on:
// https://teropa.info/blog/2016/07/28/javascript-systems-music.html#brian-enoambient-1-music-for-airports-2-11978

// Definitions
const NOTEPOOLS = {
	"musicforairports": {
		"title": "Brian Eno - Ambient 1: Music for Airports, 2/1 (1978)",
		"notes": ["F4", "Ab4", "C5", "Db5", "Eb5", "F5", "Ab5"],
	},
	"gesdur_pentatonic": {
		"title": "Ges-Dur-Pentatonik (schwarze Tasten)",
		"notes": ["F#2", "G#2", "A#2", "C#3", "D#3"],
	},
	"cdur_pentatonic": {
		"title": "C-Dur-Pentatonik",
		"notes": ["C3", "D3", "E3", "G3", "A3"],
	},
	"amoll_pentatonic": {
		"title": "C-Dur-Pentatonik",
		"notes": ["A2", "C3", "D3", "E3", "G3"],
	},
};

export class MusicGenerator {
	constructor(soundGenerator) {
		this.soundGenerator = soundGenerator;
		this.setNotepool("musicforairports");
	}

	setNotepool(notepool) {
		if (NOTEPOOLS[notepool]) {
			this.currentNotepool = NOTEPOOLS[notepool].notes;
			return true;
		} else {
			return false;
		}
	}

	playNextNote() {
		var musicalNote = this.currentNotepool[Math.floor(Math.random() * this.currentNotepool.length)];
		this.soundGenerator.playSample(musicalNote);
	}
}