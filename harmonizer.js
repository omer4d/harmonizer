var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var node = context.createScriptProcessor(1024, 1, 1);
var t = 0;
var dt = 1 / 44100;
var synth = new Synth();

node.onaudioprocess = function(e) {
    var output = e.outputBuffer.getChannelData(0);
	
    for (var i = 0; i < output.length; i++) {
        if (t > 0.3) {
            output[i] = synth.sample(dt);
        } else
            output[i] = 0;
        t += dt;
    }
};

node.connect(context.destination);















function filterIndex(arr, i) {
  return arr.filter(function(v, it) {
    return it != i;
  });
}

function pairings(arr1, arr2) {
  var res = [];
  
  if(arr1.length == 1) {
    return [[[arr1[0], arr2[0]]]];
  }

  for(var i = 0; i < arr2.length; ++i) {
    var subPairings = pairings(filterIndex(arr1, 0), filterIndex(arr2, i));
    for(var j = 0; j < subPairings.length; ++j)
      subPairings[j].push([arr1[0], arr2[i]]);
    res = res.concat(subPairings);
  }

  return res;
}

function continuityScore(pairs) {
  var score = 0;
  
  for(var i = 0; i < pairs.length; ++i) {
    var dist = Math.abs(pairs[i][1] - pairs[i][0]);

    if(dist == 0)
      score += 1;
    else if(dist == 1)
      score += 2;
    else if(dist < 3)
      score -= 1;
    else
      score -= 4;
  }

  return score;
}

function independenceScore(pairs) {
  var upCounter = 0;
  var downCounter = 0;

  for(var i = 0; i < pairs.length; ++i) {
    var diff = pairs[i][1] - pairs[i][0];
    var dist = Math.abs(diff);

    if(dist > 0 && dist < 3) {
      if(diff > 0)
        ++upCounter;
      else
        ++downCounter;
    }
  }

  return Math.min(upCounter, downCounter);
}

function progressionScore(pairs) {
	return continuityScore(pairs) + independenceScore(pairs);
}

function bestVoicePairing(chord1, chord2) {
	return pairings(chord1, chord2).sort(function(pairs1, pairs2) {
		return progressionScore(pairs2) - progressionScore(pairs1);
	})[0];
}





var major = [60, 62, 64, 65, 67, 69, 71];
var melodicMinor = [60, 62, 63, 65, 67, 69, 71];
var harmonicMinor = [60, 62, 63, 65, 67, 68, 71];
var naturalMinor = [60, 62, 63, 65, 67, 68, 70];

var inversions = [
	[0, 2, 4],
	[2, 4, 7],
	[4, 7, 9]
];

function buildChord(degree, inversion) {
	return [
		degree + inversions[inversion][0],
		degree + inversions[inversion][1],
		degree + inversions[inversion][2],
	];
}

function scaleDegToNote(scale, degree) {
	degree -= 1;
	return scale[degree % scale.length] + 12 * Math.floor(degree / scale.length);
}

function playChord(scale, chord) {
	for(var i = 0; i < chord.length; ++i) {
		degree = chord[i];
		synth.noteOn(scaleDegToNote(scale, degree));
	}
}





var lastChord = null;
var opts = new KeyboardOptions();
opts.pressable = false;
var keyboard = new Keyboard(opts);
keyboard.show();
keyboard.onKeyDown = function(kb, idx) {
	synth.noteOn(idx);
};
keyboard.onKeyUp = function(kb, idx) {
	synth.noteOff(idx);
};

function handleButton(event) {
	var vals = event.target.value.split(",").map(function(x) { return parseInt(x); });
	var degree = vals[0];
	var scale = major;
	
	synth.allNotesOff();
	keyboard.allKeysUp();
	
	var inv = vals[1];
	
	/*
	if(lastChord) {
		var bvps = [
			bestVoicePairing(lastChord, buildChord(degree, 0)),
			bestVoicePairing(lastChord, buildChord(degree, 1)),
			bestVoicePairing(lastChord, buildChord(degree, 2))
		];
		
		var bestScore = progressionScore(bvps[0]), bestIdx = 0;
		
		for(var i = 1; i < bvps.length; ++i) {
			if(progressionScore(bvps[i]) > bestScore) {
				bestScore = progressionScore(bvps[i]);
				bestIdx = i;
			}
		}
		
		inv = bestIdx;
	}*/
	
	var chord = buildChord(degree, inv);
	playChord(scale, chord);
	lastChord = chord;
	
	for(var i = 0; i < chord.length; ++i) {
		keyboard.keyDown(scaleDegToNote(scale, chord[i]));
	}
}


