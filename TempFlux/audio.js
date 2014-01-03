/// <reference path="Scripts/typings/webaudioapi/waa.d.ts" />
var SoundEffect = (function () {
    function SoundEffect(buffer, gain) {
        if (typeof gain === "undefined") { gain = 1; }
        this.buffer = buffer;
        this.loaded = false;
        this.gain = gain;
    }
    SoundEffect.prototype.doneLoading = function () {
        this.loaded = true;
        if (this.onload != null) {
            this.onload();
        }
    };
    return SoundEffect;
})();

var AudioManager = (function () {
    function AudioManager() {
        this.DEFAULT_FREQUENCY = 10000;
        try  {
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

        this.sounds = [];
        this.music = [];

        var soundMap = game.config["resource_map"]["sounds"];
        for (var key in soundMap) {
            var value = soundMap[key];
            var url = value["url"];
            var gain = value["gain"] || 1;
            this.loadSound(key, url, gain);
        }

        var musicMap = game.config["resource_map"]["music"];
        for (var key in musicMap) {
            var value = musicMap[key];
            var url = value["url"];
            var gain = value["gain"] || 1;
            this.loadMusic(key, url, gain);
        }

        this.filter = this.audio.createBiquadFilter();
        this.filter.type = 0; //LOWPASS filter
        this.filter.frequency.value = 5000;
        this.filter.connect(this.audio.destination);

        this.sfxGain.connect(this.filter);
        this.musicGain.connect(this.filter);
    }
    AudioManager.prototype.playSound = function (name) {
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
    };

    AudioManager.prototype.playMusic = function (name) {
        var _this = this;
        if (this.music[name] == null) {
            console.error("Music \'" + name + "\' not found");
            return;
        }

        if (this.music[name].loaded == false) {
            this.music[name].onload = function () {
                var source = _this.audio.createBufferSource();
                var gain = _this.audio.createGain();
                source.buffer = _this.music[name].buffer;
                source.connect(gain);
                gain.connect(_this.musicGain);
                gain.gain.value = _this.music[name].gain;
                source.loop = true;
                source.start(0);
            };
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
    };

    AudioManager.prototype.loadSound = function (name, url, gain) {
        var _this = this;
        if (this.sounds[name] != null) {
            return this.sounds[name];
        }

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function () {
            _this.audio.decodeAudioData(request.response, function (buffer) {
                _this.sounds[name] = new SoundEffect(buffer, gain);
            }, onerror);
        };

        request.send();
    };

    AudioManager.prototype.loadMusic = function (name, url, gain) {
        var _this = this;
        if (this.music[name] != null) {
            return this.music[name];
        }

        this.music[name] = new SoundEffect(null, gain);

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function () {
            _this.audio.decodeAudioData(request.response, function (buffer) {
                _this.music[name].buffer = buffer;
                _this.music[name].doneLoading();
            }, onerror);
        };

        request.send();
    };

    AudioManager.prototype.update = function (dt) {
        this.filter.frequency.value = this.DEFAULT_FREQUENCY * timeScale * timeScale;
    };
    return AudioManager;
})();
//# sourceMappingURL=audio.js.map
