/// <reference path="Scripts/typings/webaudioapi/waa.d.ts" />

class SoundEffect {
    buffer: AudioBuffer;
    loaded: boolean;
    gain: number;
    onload: Function;

    constructor(buffer: AudioBuffer, gain: number = 1) {
        this.buffer = buffer;
        this.loaded = false;
        this.gain = gain;
    }

    doneLoading() {
        this.loaded = true;
        if (this.onload != null) {
            this.onload();
        }
    }
}

class AudioManager {
    sounds: SoundEffect[];
    music: SoundEffect[];
    audio: AudioContext;

    sfxGain: GainNode;
    musicGain: GainNode;

    constructor() {
        try {
            this.audio = new webkitAudioContext();
        } catch (error) {
            this.audio = new AudioContext();
        }

        if (!this.audio) {
            var errorMessage = "Failed to initialize Web Audio API, it may not be supported by your browser";
            console.error(errorMessage);
            alert(errorMessage);
            return;
        }

        this.sfxGain = this.audio.createGain();
        this.musicGain = this.audio.createGain();

        this.sfxGain.gain.value = game.config["sfx_volume"];
        this.musicGain.gain.value = game.config["music_volume"];

        this.sfxGain.connect(this.audio.destination);
        this.musicGain.connect(this.audio.destination);

        this.sounds = [];
        this.music = [];

        var soundMap = game.config["resource_map"]["sounds"];
        for (var key in soundMap) {
            var value = soundMap[key];
            var url: string = value["url"];
            var gain: number = value["gain"] || 1;
            this.loadSound(key, url, gain);
        }

        var musicMap = game.config["resource_map"]["music"];
        for (var key in musicMap) {
            var value = musicMap[key];
            var url: string = value["url"];
            var gain: number = value["gain"] || 1;
            this.loadMusic(key, url, gain);
        }
    }

    playSound(name: string) {
        if (this.sounds[name] == null) {
            console.error("Sound \'" + name + "\' not found or has not been loaded");
            return;
        }

        var source = this.audio.createBufferSource();
        var gain = this.audio.createGain();
        source.buffer = this.sounds[name].buffer;
        source.connect(gain);
        gain.connect(this.sfxGain);
        gain.gain.value = this.sounds[name].gain;
        source.start(0);
    }

    playMusic(name: string) {
        if (this.music[name] == null) {
            console.error("Music \'" + name + "\' not found");
            return;
        }

        if (this.music[name].loaded == false) {
            this.music[name].onload = () => {
                var source = this.audio.createBufferSource();
                var gain = this.audio.createGain();
                source.buffer = this.music[name].buffer;
                source.connect(gain);
                gain.connect(this.musicGain);
                gain.gain.value = this.music[name].gain;
                source.loop = true;
                source.start(0);
            }
            return;
        }

        var source = this.audio.createBufferSource();
        var gain = this.audio.createGain();
        source.buffer = this.music[name].buffer;
        source.connect(gain);
        gain.connect(this.musicGain);
        gain.gain.value = this.music[name].gain;
        source.loop = true;
        source.start(0);
    }

    loadSound(name: string, url: string, gain: number) {
        if (this.sounds[name] != null) {
            return this.sounds[name];
        }

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = () => {
            this.audio.decodeAudioData(request.response, (buffer: AudioBuffer) => {
                this.sounds[name] = new SoundEffect(buffer, gain);
            }, onerror);
        };

        request.send();
    }

    loadMusic(name: string, url: string, gain: number) {
        if (this.music[name] != null) {
            return this.music[name];
        }

        this.music[name] = new SoundEffect(null, gain);

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = () => {
            this.audio.decodeAudioData(request.response, (buffer: AudioBuffer) => {
                this.music[name].buffer = buffer;
                this.music[name].doneLoading();
            }, onerror);
        };

        request.send();
    }
}