function Synth(voiceConstructor) {
    this.voiceConstructor = voiceConstructor || DefaultVoice;
    this.voiceList = {
        next: null
    };
    this.keyVoices = [];
}

Synth.prototype.sample = function(dt) {
    var prevVoice = this.voiceList;
    var sum = 0;

    for (var voice = this.voiceList.next; voice !== null; voice = voice.next) {
        if (voice.dead()) {
            prevVoice.next = voice.next;
        } else
            sum += voice.sample(dt);
        prevVoice = voice;
    }

    return sum;
}

Synth.prototype.noteOff = function(noteNum) {
	if(this.keyVoices[noteNum]) {
		this.keyVoices[noteNum].triggerDecay();
	}
};

Synth.prototype.noteOn = function(noteNum) {
    var freq = 8.1757989156 * Math.pow(Math.pow(2, 1 / 12), noteNum);
    var voice = new this.voiceConstructor(freq);
    voice.next = this.voiceList.next;
    this.voiceList.next = voice;
	
	this.noteOff(noteNum);
	this.keyVoices[noteNum] = voice;
};

Synth.prototype.allNotesOff = function() {
	for (var voice = this.voiceList.next; voice !== null; voice = voice.next)
		if (!voice.dead())
			voice.triggerDecay();
};

function DefaultVoice(freq) {
    this.freq = freq;
    this.time = 0;
    this.decayStartTime = -1;
    this.next = null;
}

DefaultVoice.prototype.sample = function(dt) {
    var t = this.time,
        f = this.freq;
    var v1 = Math.sin(6.2831 * f * t) * Math.exp(-3 * t);
    var v2 = Math.sin(6.2831 * f * 2.01 * t) * Math.exp(-4.0 * t) * 0.5 * 0.5;
    var v3 = Math.sin(6.2831 * f * 3.03 * t) * Math.exp(-5.0 * t) * 0.5 * 0.5 * 0.5;
    var v4 = Math.sin(6.2831 * f * 4.01 * t) * Math.exp(-3.0 * t) * 0.5 * 0.5 * 0.5 * 0.5;
    var v5 = Math.sin(6.2831 * f * 0.501 * t) * Math.exp(-0.5 * t) * 0.2;
    var v6 = Math.sin(6.2831 * f * 4.005 * t) * Math.exp(-3.0 * t) * 0.5 * 0.5 * 0.5;
    var v7 = Math.sin(6.2831 * f * 9.1 * t) * Math.exp(-11.0 * t) * 0.5 * 0.5 * 0.5 * 0.5 * 0.5;
    var v = (v1 + v2 + v3 + v4 + v5 + v6 + v7) * 0.5;
    this.time = t + dt;
    return (this.decayStartTime < 0 ? v : v * Math.exp(-15.0 * t - this.decayStartTime)) / 5.0;
}

DefaultVoice.prototype.triggerDecay = function() {
    this.decayStartTime = this.time;
}

DefaultVoice.prototype.dead = function() {
    return this.decayStartTime < 0 ? this.time > 5 : (this.time - this.decayStartTime) > 0.2;
}