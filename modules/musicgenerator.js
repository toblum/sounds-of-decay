// Functions to generate music
// Based on:
// https://teropa.info/blog/2016/07/28/javascript-systems-music.html#brian-enoambient-1-music-for-airports-2-11978

export class MusicGenerator {
    // Definitions
    MUSICAL_NOTES_AIRPORTS = ['F4', 'Ab4', 'C5', 'Db5', 'Eb5', 'F5', 'Ab5'];

    MELODIES = [
        "musicforairports",
    ];

    constructor (soundGenerator) {
		this.soundGenerator = soundGenerator;
        this.currentMelody = MELODIES[0];
    }

    setMelody(melody) {
        if (MELODIES.contains(melody)) {
            this.currentMelody = melody;
			return true;
        } else {
			return false;
		}
    }

	playNextNote() {
		if (this.currentMelody === "musicforairports") {
			var musicalNote = MUSICAL_NOTES_AIRPORTS[Math.floor(Math.random() * MUSICAL_NOTES_AIRPORTS.length)];
			this.soundGenerator.playSample(musicalNote);
		}
	}
}