// Functions to generate sounds using browsers AudioContext
// Based on: https://teropa.info/blog/2016/07/28/javascript-systems-music.html#brian-enoambient-1-music-for-airports-2-11978
// Optimized and restructured code, intruduced simple caches
// Instruments: https://github.com/peastman/sso
// Reverb from: https://www.airwindows.com/airwindows-impulses/


export class SoundGenerator {
    // Definitions
    SAMPLE_LIBRARY = {
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
	CONVOLVER_LIBRARY = {
		'AirportTerminal' : 'samples/AirportTerminal.wav',
		'RoomMedium' : 'samples/RoomMedium.wav',
	};
    OCTAVE = [
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


    _audioContext = null;

	_sampleCache = {};
	_convolverCache = {};
	_instrument = "Grand Piano";
	_convolver = null;

    constructor() {
        this._audioContext = new AudioContext();
    }


    // Helper functions
    fetchSample(path) {
        return fetch(encodeURIComponent(path))
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => this._audioContext.decodeAudioData(arrayBuffer));
    }

    noteValue(note, octave) {
        return octave * 12 + this.OCTAVE.indexOf(note);
    }
    
    getNoteDistance(note1, octave1, note2, octave2) {
        return this.noteValue(note1, octave1) - this.noteValue(note2, octave2);
    }
    
    getNearestSample(sampleBank, note, octave) {
        let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
            let distanceToA = Math.abs(
                this.getNoteDistance(note, octave, sampleA.note, sampleA.octave)
            );
            let distanceToB = Math.abs(
                this.getNoteDistance(note, octave, sampleB.note, sampleB.octave)
            );
            return distanceToA - distanceToB;
        });
        return sortedBank[0];
    }
    
    flatToSharp(note) {
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

    async getSample(instrument, noteAndOctave) {
        let [, requestedNote, requestedOctave] = /^(\w[b\#]?)(\d)$/.exec(
            noteAndOctave
        );
        requestedOctave = parseInt(requestedOctave, 10);
        requestedNote = this.flatToSharp(requestedNote);
        let sampleBank = this.SAMPLE_LIBRARY[instrument];
        let sample = this.getNearestSample(sampleBank, requestedNote, requestedOctave);
        let distance = this.getNoteDistance(
            requestedNote,
            requestedOctave,
            sample.note,
            sample.octave
        );

		// Implement simple sample cache
		if (this._sampleCache[sample.file]) {
			// console.log("getSample() CACHED", instrument, noteAndOctave);
			return {
				audioBuffer: this._sampleCache[sample.file],
				distance: distance,
			};
		} else {
			const audioBuffer = await this.fetchSample(sample.file);
			// console.log("getSample() REMOTE", instrument, noteAndOctave);
			this._sampleCache[sample.file] = audioBuffer;
			return {
				audioBuffer: audioBuffer,
				distance: distance,
			};
		}
    }


	// Public playing functions
	async playSample(note, delaySeconds = 0) {
		await this.playSampleWithInstrument(this._instrument, note, this._convolver, delaySeconds);
	};

	async playSampleWithInstrument(instrument, note, destination = null, delaySeconds = 0) {
		const { audioBuffer, distance } = await this.getSample(instrument, note);

		let playbackRate = Math.pow(2, distance / 12);
		let bufferSource = this._audioContext.createBufferSource();
		bufferSource.buffer = audioBuffer;
		bufferSource.playbackRate.value = playbackRate;

		if (!destination) {
			// Output directly to the destination
			bufferSource.connect(this._audioContext.destination);
		} else {
			// Output to the given destination
			bufferSource.connect(destination);
		}

		const delay = (delaySeconds > 0) ? this._audioContext.currentTime + delaySeconds : null;
		bufferSource.start(delay);
	}

	async loadConvolver(url) {
		const convolverBuffer = await this.fetchSample(url);
		
		let convolver = this._audioContext.createConvolver();
		convolver.buffer = convolverBuffer;
		convolver.connect(this._audioContext.destination);
		console.log("Convolver loaded");
		return convolver;
	}

	async setConvolver(convolver) {
		const url = this.CONVOLVER_LIBRARY[convolver];

		if (url) {
			if (!this._convolverCache[url]) {
				const convolverSample = await this.loadConvolver(url);
				this._convolverCache[url] = convolverSample;
			}
			console.log("setConvolver()", convolver, url);
			this._convolver = this._convolverCache[url];
		} else {
			console.log("Deactivated convolver", convolver);
			this._convolver = null;
		}
	}

	setInstrument(instrument) {
		if (this.SAMPLE_LIBRARY[instrument]) {
			this._instrument = instrument;
		} else {
			console.warn("Selected instrument not found:", instrument);
		}
	}

	suspend() {
		this._audioContext.suspend();
	}

	resume() {
		this._audioContext.resume();
	}
}
