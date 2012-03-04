/* 	
Charlie Roberts 2012 MIT License
Execute a callback in relation to a continuously running clock, on a particular beat.
TODO: This is also now the master clock in Gibber and should be abstracted.

Usage:
c = audioLib.Callback;
c.addCallback("Gibber.setBPM(120)", _4);	// time is measured in samples

This will set the bpm to 120 at the start of the next quarter beat

TODO: Time subdivision doesn't appear to work; always defaults to one measure
*/

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){

function Callback() {
	this.measureLengthInSamples = _1;
	
	function bpmCallback(obj) {
		var that = obj;
		return function(percentageChangeForBPM) {
			that.measureLengthInSamples = _1;
		}
	}
	
	Gibber.registerObserver("bpm", bpmCallback(this));
}

Callback.prototype = {
	callbacks : [],
	slaves : [],
	phase : 0,
	measureLengthInSamples : 0,
	value : 0,
	
	addCallback : function(callback, subdivision, shouldLoop, shouldWait) {
		var isLoop = false;
		
		if(typeof shouldWait === 'undefined') shouldWait = true;
		if(typeof shouldLoop === 'undefined') shouldLoop = false;
		var currentSubdivision = Math.floor(this.phase / subdivision); // 0
		var nextSubdivision = (currentSubdivision + 1) * subdivision; // 1 * _1 = 88200
		//console.log("Current Subdivison = " + currentSubdivision + " : next subdivision = " + nextSubdivision + " : phase = " + this.phase);

		function _callback() {
			var call = callback;
			var loop = shouldLoop;
			return function() {
				if(typeof call === "string") {
					eval(call);
				}else{
					call();
				}
				return loop;
			}
		}
		//console.log("time till event = " + (nextSubdivision - this.phase) ) // 88200 - 88187 / 441
		var stop;
		this.callbacks.push(_callback());
		
		return this.callbacks[this.callbacks.length - 1];
		// if(shouldWait) {
		// 			stop = Sink.doInterval(_callback(), ((nextSubdivision - this.phase) / (Gibber.sampleRate / 1000)) );
		// 		}else{
		// 			stop = Sink.doInterval(_callback(), subdivision / (Gibber.sampleRate / 1000) );
		// 		}
	},
	// 1.2 with no control rate
	generate : function() {
		//if(Gibber.debug) console.log(_16)
		if(this.phase % _64 <= .5) {
			this.counter++;
			for(var i = 0, _sl = this.slaves.length; i < _sl; i++) {
				var slave = this.slaves[i];
				if(this.phase % slave.speed <= .5) {
					slave.advance();
				}
			}
		}
		this.phase++;
		if(this.phase >= this.measureLengthInSamples) { 
			this.phase = 0;
			for(var i = 2; i <= 4; i++) {
				$("#n" + i).css("color", "#444");
			}
			$("#n1").css("color", "red");
			if(this.callbacks.length != 0) {
				for(var j = 0; j < this.callbacks.length; j++) {
					try{
						var check = this.callbacks[j]();
						if(!check) this.callbacks.splice(j,1);
					}catch(e) {
						G.log(e.toString());
						console.log(e);
						this.callbacks.splice(j,1);
					}
				}
			}
		}else{
			if(this.phase % _4 == 0) {
				var subdivision = Math.floor(this.phase / _4) + 1;
				$("#n" + subdivision).css("color", "red");
			}
		}
	},
	
	getMix : function() { return this.value; }, // not used but just in case
}

audioLib.generators('Callback', Callback);

audioLib.Callback = audioLib.generators.Callback;

}(audioLib));
audioLib.plugins('Callback', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());
