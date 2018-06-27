function Voice(freq) {
    this.freq = freq;
    this.time = 0;
    this.decayStartTime = -1;
    this.next = null;
}

Voice.prototype.sample = function(dt) {
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
    return this.decayStartTime < 0 ? v : v * Math.exp(-15.0 * t - this.decayStartTime);
}

Voice.prototype.triggerDecay = function() {
    this.decayStartTime = this.time;
}

Voice.prototype.dead = function() {
    return this.decayStartTime < 0 ? this.time > 3 : (this.time - this.decayStartTime) > 0.2;
}

function Synth(voiceConstructor) {
    this.voiceConstructor = voiceConstructor;
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

Synth.prototype.noteOn = function(noteNum) {
    var freq = 8.1757989156 * Math.pow(Math.pow(2, 1 / 12), noteNum);
    var voice = new this.voiceConstructor(freq);
    voice.next = this.voiceList.next;
    this.voiceList.next = voice;
	
	if(this.keyVoices[noteNum]) {
		this.keyVoices[noteNum].triggerDecay();
	}
	
	this.keyVoices[noteNum] = voice;
};

Synth.prototype.noteOff = function(noteNum) {
	if(this.keyVoices[noteNum]) {
		this.keyVoices[noteNum].triggerDecay();
	}
};






var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var node = context.createScriptProcessor(1024, 1, 1);
var t = 0;
var dt = 1 / 44100;
var synth = new Synth(Voice);

node.onaudioprocess = function(e) {
    var output = e.outputBuffer.getChannelData(0);

    var counter = 0;
    for (var v = synth.voiceList; v !== null; v = v.next) {
        ++counter;
    }
	
    for (var i = 0; i < output.length; i++) {
        if (t > 0.3) {
            output[i] = synth.sample(dt);
        } else
            output[i] = 0;
        t += dt;
    }
};
node.connect(context.destination);


/*
setTimeout(function() {
	node.disconnect(context.destination);
}, 5000);*/


var major = [60, 62, 64, 65, 67, 69, 71, 72];
var melodicMinor = [60, 62, 63, 65, 67, 69, 71, 72];
var harmonicMinor = [60, 62, 63, 65, 67, 68, 71, 72];
var naturalMinor = [60, 62, 63, 65, 67, 68, 70, 72];
var idx = 0;
var dir = 1;

var scale = major;
var counter = 0;

setInterval(function() {
    //synth.triggerNote(60 + Math.random() * 12);
    synth.noteOn(scale[Math.floor(Math.random() * scale.length)]);
    //synth.triggerNote(scale[(idx++) % scale.length]);


    //idx += Math.floor(Math.random() * 2 + 1) * dir;



    /*
  if(counter % 4 === 0) {
	if(Math.random() < 0.2) {
		console.log("A");
		dir *= -1;
		idx += dir;
	}
	else {
		console.log("B");
		idx += Math.floor(Math.random() * 2 + 1) * dir;
	}
  }else {
	 idx += dir;
  }
  
  idx %= scale.length;
  if(idx < 0) idx += scale.length;
  
  synth.triggerNote(scale[idx]);
  

  ++counter;
  */
}, 100);

//node.disconnect(context.destination);

/*
setTimeout(function() {
	voice.triggerDecay();
  voice2.triggerDecay();
  voice3.triggerDecay();
}, 1000);*/