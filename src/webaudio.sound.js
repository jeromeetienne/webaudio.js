/**
 * sound instance
 *
 * @class Handle one sound for WebAudio
 *
 * @param {tQuery.World} [world] the world on which to run
 * @param {WebAudio.NodeChainBuilder} [nodeChain] the nodeChain to use
*/
WebAudio.Sound	= function(webaudio, nodeChain){
	this._webaudio	= webaudio;
	this._context	= this._webaudio.context();

	console.assert( this._webaudio instanceof WebAudio );

	// create a default NodeChainBuilder if needed
	if( nodeChain === undefined ){
		nodeChain	= new WebAudio.NodeChainBuilder(this._context)
					.bufferSource().gainNode().analyser().panner();
	}
	// setup this._chain
	console.assert( nodeChain instanceof WebAudio.NodeChainBuilder );
	this._chain	= nodeChain;
	// connect this._chain.last() node to this._webaudio._entryNode()
	this._chain.last().connect( this._webaudio._entryNode() );
	
	// create some alias
	this._source	= this._chain.nodes().bufferSource;
	this._gainNode	= this._chain.nodes().gainNode;
	this._analyser	= this._chain.nodes().analyser;
	this._panner	= this._chain.nodes().panner;
	
	// sanity check
	console.assert(this._source	, "no bufferSource: not yet supported")
	console.assert(this._gainNode	, "no gainNode: not yet supported")
	console.assert(this._analyser	, "no analyser: not yet supported")
	console.assert(this._panner	, "no panner: not yet supported")
};

WebAudio.Sound.create	= function(webaudio, nodeChain){
	return new WebAudio.Sound(webaudio,  nodeChain);
}

/**
 * destructor
*/
WebAudio.Sound.prototype.destroy	= function(){
	// disconnect from this._webaudio
	this._chain.last().disconnect();
	// destroy this._chain
	this._chain.destroy();
	this._chain	= null;
};

/**
 * vendor.js way to make plugins ala jQuery
 * @namespace
*/
WebAudio.Sound.fn	= WebAudio.Sound.prototype;

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * getter of the chain nodes
*/
WebAudio.Sound.prototype.nodes	= function(){
	return this._chain.nodes();
};

/**
 * @returns {Boolean} true if the sound is playable, false otherwise
*/
WebAudio.Sound.prototype.isPlayable	= function(){
	return this._source.buffer ? true : false;
};

/**
 * play the sound
 *
 * @param {Number} [time] time when to play the sound
*/
WebAudio.Sound.prototype.play		= function(time){
	// handle parameter polymorphism
	if( time ===  undefined )	time	= 0;
	// if not yet playable, ignore
	// - usefull when the sound download isnt yet completed
	if( this.isPlayable() === false )	return;
	// clone the bufferSource
	var clonedNode	= this._chain.cloneBufferSource();
	// set the noteOn
	clonedNode.start(time);
	// create the source object
	var source	= {
		node	: clonedNode,
		stop	: function(time){
			if( time ===  undefined )	time	= 0;
			this.node.stop(time);
			return source;	// for chained API
		}
	}
	// return it
	return source;
};

/**
 * getter/setter on the volume
 *
 * @param {Number} [value] the value to set, if not provided, get current value
*/
WebAudio.Sound.prototype.volume	= function(value){
	if( value === undefined )	return this._gainNode.gain.value;
	this._gainNode.gain.value	= value;
	return this;	// for chained API
};


/**
 * getter/setter on the loop
 * 
 * @param {Number} [value] the value to set, if not provided, get current value
*/
WebAudio.Sound.prototype.loop	= function(value){
	if( value === undefined )	return this._source.loop;
	this._source.loop	= value;
	return this;	// for chained API
};

/**
 * getter/setter on the source buffer
 * 
 * @param {Number} [value] the value to set, if not provided, get current value
*/
WebAudio.Sound.prototype.buffer	= function(value){
	if( value === undefined )	return this._source.buffer;
	this._source.buffer	= value;
	return this;	// for chained API
};


/**
 * Set parameter for the pannerCone
 *
 * @param {Number} innerAngle the inner cone hangle in radian
 * @param {Number} outerAngle the outer cone hangle in radian
 * @param {Number} outerGain the gain to apply when in the outerCone
*/
WebAudio.Sound.prototype.pannerCone	= function(innerAngle, outerAngle, outerGain)
{
	this._panner.coneInnerAngle	= innerAngle * 180 / Math.PI;
	this._panner.coneOuterAngle	= outerAngle * 180 / Math.PI;
	this._panner.coneOuterGain	= outerGain;
	return this;	// for chained API
};

/**
 * getter/setter on the pannerConeInnerAngle
 * 
 * @param {Number} value the angle in radian
*/
WebAudio.Sound.prototype.pannerConeInnerAngle	= function(value){
	if( value === undefined )	return this._panner.coneInnerAngle / 180 * Math.PI;
	this._panner.coneInnerAngle	= value * 180 / Math.PI;
	return this;	// for chained API
};

/**
 * getter/setter on the pannerConeOuterAngle
 *
 * @param {Number} value the angle in radian
*/
WebAudio.Sound.prototype.pannerConeOuterAngle	= function(value){
	if( value === undefined )	return this._panner.coneOuterAngle / 180 * Math.PI;
	this._panner.coneOuterAngle	= value * 180 / Math.PI;
	return this;	// for chained API
};

/**
 * getter/setter on the pannerConeOuterGain
 * 
 * @param {Number} value the value
*/
WebAudio.Sound.prototype.pannerConeOuterGain	= function(value){
	if( value === undefined )	return this._panner.coneOuterGain;
	this._panner.coneOuterGain	= value;
	return this;	// for chained API
};

/**
 * compute the amplitude of the sound (not sure at all it is the proper term)
 *
 * @param {Number} width the number of frequencyBin to take into account
 * @returns {Number} return the amplitude of the sound
*/
WebAudio.Sound.prototype.amplitude	= function(width)
{
	// handle paramerter
	width		= width !== undefined ? width : 2;
	// inint variable
	var analyser	= this._analyser;
	var freqByte	= new Uint8Array(analyser.frequencyBinCount);
	// get the frequency data
	analyser.getByteFrequencyData(freqByte);
	// compute the sum
	var sum	= 0;
	for(var i = 0; i < width; i++){
		sum	+= freqByte[i];
	}
	// complute the amplitude
	var amplitude	= sum / (width*256-1);
	// return ampliture
	return amplitude;
}

/**
 * Generate a sinusoid buffer.
 * FIXME should likely be in a plugin
*/
WebAudio.Sound.prototype.tone	= function(hertz, seconds){
	// handle parameter
	hertz	= hertz !== undefined ? hertz : 200;
	seconds	= seconds !== undefined ? seconds : 1;
	// set default value	
	var nChannels	= 1;
	var sampleRate	= 44100;
	var amplitude	= 2;
	// create the buffer
	var buffer	= this._webaudio.context().createBuffer(nChannels, seconds*sampleRate, sampleRate);
	var fArray	= buffer.getChannelData(0);
	// fill the buffer
	for(var i = 0; i < fArray.length; i++){
		var time	= i / buffer.sampleRate;
		var angle	= hertz * time * Math.PI;
		fArray[i]	= Math.sin(angle)*amplitude;
	}
	// set the buffer
	this.buffer(buffer);
	return this;	// for chained API
}


/**
 * Put this function is .Sound with getByt as private callback
*/
WebAudio.Sound.prototype.makeHistogram	= function(nBar)
{	
	// get analyser node
	var analyser	= this._analyser;
	// allocate the private histo if needed - to avoid allocating at every frame
	//this._privHisto	= this._privHisto || new Float32Array(analyser.frequencyBinCount);
	this._privHisto	= this._privHisto || new Uint8Array(analyser.frequencyBinCount);
	// just an alias
	var freqData	= this._privHisto;

	// get the data
	//analyser.getFloatFrequencyData(freqData);
	analyser.getByteFrequencyData(freqData);
	//analyser.getByteTimeDomainData(freqData);

	/**
	 * This should be in imageprocessing.js almost
	*/
	var makeHisto	= function(srcArr, dstLength){
		var barW	= Math.floor(srcArr.length / dstLength);
		var nBar	= Math.floor(srcArr.length / barW);
		var arr		= []
		for(var x = 0, arrIdx = 0; x < srcArr.length; arrIdx++){
			var sum	= 0;
			for(var i = 0; i < barW; i++, x++){
				sum += srcArr[x];
			}
			var average	= sum/barW;
			arr[arrIdx]	= average;
		}
		return arr;
	}
	// build the histo
	var histo	= makeHisto(freqData, nBar);
	// return it
	return histo;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Load a sound
 *
 * @param {String} url the url of the sound to load
 * @param {Function} onSuccess function to notify once the url is loaded (optional)
 * @param {Function} onError function to notify if an error occurs (optional)
*/
WebAudio.Sound.prototype.load = function(url, onSuccess, onError){
	// handle default arguments
	onError	= onError	|| function(){
		console.warn("unable to load sound "+url);
	}
	// try to load the user	
	this._loadAndDecodeSound(url, function(buffer){
		this._source.buffer	= buffer;
		onSuccess && onSuccess(this);
	}.bind(this), function(){
		onError && onError(this);
	}.bind(this));
	return this;	// for chained API
};

/**
 * Load and decode a sound
 *
 * @param {String} url the url where to get the sound
 * @param {Function} onLoad the function called when the sound is loaded and decoded (optional)
 * @param {Function} onError the function called when an error occured (optional)
*/
WebAudio.Sound.prototype._loadAndDecodeSound	= function(url, onLoad, onError){
	var context	= this._context;
	var request	= new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType	= 'arraybuffer';
	// Decode asynchronously
	request.onload	= function() {
		context.decodeAudioData(request.response, function(buffer) {
			onLoad && onLoad(buffer);
		}, function(){
			onError && onError();
		});
	};
	// actually start the request
	request.send();
}
