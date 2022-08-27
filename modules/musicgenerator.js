// Functions to generate music
// Based on:
// https://teropa.info/blog/2016/07/28/javascript-systems-music.html#brian-enoambient-1-music-for-airports-2-11978

// Definitions
export const NOTEPOOLS = {
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

export const MELODYGENERATOR = {
	"random": {"title": "Random note from the pool"},
	"static_melody": {"title": "Static melody"},
	"changing_melody_10": {"title": "Changing melody, 10% chance"},
	"changing_melody_30": {"title": "Changing melody, 30% chance"},
	"changing_melody_60": {"title": "Changing melody, 60% chance"},
};

export class MusicGenerator {
	constructor(soundGenerator) {
		this.soundGenerator = soundGenerator;
		this.setNotepool("musicforairports");
		this.setMelodygenerator("random");
		this.currentNoteIndex = 0;
	}

	setNotepool(notepool) {
		if (NOTEPOOLS[notepool]) {
			this.currentNotepool = NOTEPOOLS[notepool].notes;
			this.currentMelody = [...NOTEPOOLS[notepool].notes]; // Cloning to get a copy of the pool forthe melody
			return true;
		} else {
			return false;
		}
	}

	setMelodygenerator(melodygenerator) {
		if (MELODYGENERATOR[melodygenerator]) {
			this.currentMelodygenerator = melodygenerator;
			return true;
		} else {
			return false;
		}
	}

	increaseNoteIndex() {
		this.currentNoteIndex++;
		if (this.currentNoteIndex >= this.currentMelody.length) {
			this.currentNoteIndex = 0;
		}
	}

	playNextNote() {
		var nextMusicalNote;
		if (this.currentMelodygenerator === "random") {
			// RandomNote
			nextMusicalNote = this.currentMelody[Math.floor(Math.random() * this.currentMelody.length)];
		} else {
			// Playing melody
			nextMusicalNote = this.currentMelody[this.currentNoteIndex];

			// Check if the current note should be changed
			let noteShouldChange = false;
			if (this.currentMelodygenerator === "changing_melody_10" && Math.random() < 0.1) {
				noteShouldChange = true;
			}
			if (this.currentMelodygenerator === "changing_melody_30" && Math.random() < 0.3) {
				noteShouldChange = true;
			}
			if (this.currentMelodygenerator === "changing_melody_60" && Math.random() < 0.3) {
				noteShouldChange = true;
			}

			if (noteShouldChange) {
				var newNote = this.currentNotepool[Math.floor(Math.random()*this.currentNotepool.length)];
				this.currentMelody[this.currentNoteIndex] = newNote;
				console.log("Melody change:", newNote, this.currentMelody);
			}

			this.increaseNoteIndex();
		}

		if (nextMusicalNote) {
			this.soundGenerator.playSample(nextMusicalNote);
		}

	}
}