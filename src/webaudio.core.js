/**
 * Tutorials:
 * http://www.html5rocks.com/en/tutorials/webaudio/games/
 * http://www.html5rocks.com/en/tutorials/webaudio/positional_audio/ <- +1 as it is three.js
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 *
 * Spec:
 * https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
 *
 * Chromium Demo:
 * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html  <- running page
 * http://code.google.com/p/chromium/source/browse/trunk/samples/audio/ <- source
*/


/**
 * Notes on removing tQuery dependancy
 * * some stuff depends on tQuery
 * * find which one
 * * tQuery.Webaudio got a world link for the listener
 *   * do a plugin with followListener(world), unfollowListener(world)
 * * namespace become WebAudio.* instead of WebAudio.*
*/

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		WebAudio							//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////


window.AudioContext	= window.AudioContext || window.webkitAudioContext;

/**
 * Main class to handle webkit audio
 * 
 * TODO make the clip detector from http://www.html5rocks.com/en/tutorials/webaudio/games/
 *
 * @class Handle webkit audio API
 *
 * @param {tQuery.World} [world] the world on which to run 
*/
WebAudio	= function(){
	// sanity check - the api MUST be available
	if( WebAudio.isAvailable === false ){
		this._addRequiredMessage();
		// Throw an error to stop execution
		throw new Error('WebAudio API is required and not available.')	
	}
	
	// create the context
	this._ctx	= new AudioContext();
	// setup internal variable
	this._muted	= false;
	this._volume	= 1;

	// setup the end of the node chain
	// TODO later code the clipping detection from http://www.html5rocks.com/en/tutorials/webaudio/games/ 
	this._gainNode	= this._ctx.createGain();
	this._compressor= this._ctx.createDynamicsCompressor();
	this._gainNode.connect( this._compressor );
	this._compressor.connect( this._ctx.destination );	

	// init page visibility
	this._pageVisibilityCtor();	
};


/**
 * vendor.js way to make plugins ala jQuery
 * @namespace
*/
WebAudio.fn	= WebAudio.prototype;


/**
 * destructor
*/
WebAudio.prototype.destroy	= function(){
	this._pageVisibilityDtor();
};

/**
 * @return {Boolean} true if it is available or not
*/
WebAudio.isAvailable	= window.AudioContext ? true : false;

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

WebAudio.prototype._addRequiredMessage = function(parent) {
	// handle defaults arguements
	parent	= parent || document.body;
	// message directly taken from Detector.js
	var domElement = document.createElement( 'div' );
	domElement.style.fontFamily	= 'monospace';
	domElement.style.fontSize	= '13px';
	domElement.style.textAlign	= 'center';
	domElement.style.background	= '#eee';
	domElement.style.color		= '#000';
	domElement.style.padding	= '1em';
	domElement.style.width		= '475px';
	domElement.style.margin		= '5em auto 0';
	domElement.innerHTML		= [
		'Your browser does not seem to support <a href="https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html">WebAudio API</a>.<br />',
		'Try with <a href="https://www.google.com/intl/en/chrome/browser/">Chrome Browser</a>.'
	].join( '\n' );
	// add it to the parent
	parent.appendChild(domElement);
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * get the audio context
 *
 * @returns {AudioContext} the audio context
*/
WebAudio.prototype.context	= function(){
	return this._ctx;
};

/**
 * Create a sound
 *
 * @returns {WebAudio.Sound} the sound just created
*/
WebAudio.prototype.createSound	= function()
{
	var webaudio	= this;
	var sound	= new WebAudio.Sound(webaudio);
	return sound;
}


/**
 * return the entry node in the master node chains
*/
WebAudio.prototype._entryNode	= function(){
	//return this._ctx.destination;
	return this._gainNode;
}

//////////////////////////////////////////////////////////////////////////////////
//		volume/mute							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * getter/setter on the volume
*/
WebAudio.prototype.volume	= function(value){
	if( value === undefined )	return this._volume;
	// update volume
	this._volume	= value;
	// update actual volume IIF not muted
	if( this._muted  === false ){
		this._gainNode.gain.value	= this._volume;	
	}
	// return this for chained API
	return this;
};

/** 
 * getter/setter for mute
*/
WebAudio.prototype.mute	= function(value){
	if( value === undefined )	return this._muted;
	this._muted	= value;
	this._gainNode.gain.value	= this._muted ? 0 : this._volume;
	return this;	// for chained API
}

/**
 * to toggle the mute
*/
WebAudio.prototype.toggleMute	= function(){
	if( this.mute() )	this.mute(false);
	else			this.mute(true);
}

//////////////////////////////////////////////////////////////////////////////////
//		pageVisibility							//
//////////////////////////////////////////////////////////////////////////////////


WebAudio.prototype._pageVisibilityCtor	= function(){
	// shim to handle browser vendor
	this._pageVisibilityEventStr	= (document.hidden !== undefined	? 'visibilitychange'	:
		(document.mozHidden	!== undefined		? 'mozvisibilitychange'	:
		(document.msHidden	!== undefined		? 'msvisibilitychange'	:
		(document.webkitHidden	!== undefined		? 'webkitvisibilitychange' :
		console.assert(false, "Page Visibility API unsupported")
	))));
	this._pageVisibilityDocumentStr	= (document.hidden !== undefined ? 'hidden' :
		(document.mozHidden	!== undefined ? 'mozHidden' :
		(document.msHidden	!== undefined ? 'msHidden' :
		(document.webkitHidden	!== undefined ? 'webkitHidden' :
		console.assert(false, "Page Visibility API unsupported")
	))));
	// event handler for visibilitychange event
	this._$pageVisibilityCallback	= function(){
		var isHidden	= document[this._pageVisibilityDocumentStr] ? true : false;
		this.mute( isHidden ? true : false );
	}.bind(this);
	// bind the event itself
	document.addEventListener(this._pageVisibilityEventStr, this._$pageVisibilityCallback, false);
}

WebAudio.prototype._pageVisibilityDtor	= function(){
	// unbind the event itself
	document.removeEventListener(this._pageVisibilityEventStr, this._$pageVisibilityCallback, false);
}
