/**
 * Constructor
 *
 * @class builder to generate nodes chains. Used in WebAudio.Sound
 * @param {AudioContext} audioContext the audio context
*/
WebAudio.NodeChainBuilder	= function(audioContext){
	console.assert(audioContext instanceof AudioContext);
	this._context	= audioContext;
	this._firstNode	= null;
	this._lastNode	= null;
	this._nodes	= {};
};

/**
 * creator
 * 
 * @param  {webkitAudioContext} 	audioContext the context	
 * @return {WebAudio.NodeChainBuider}	just created object
 */
WebAudio.NodeChainBuilder.create= function(audioContext){
	return new WebAudio.NodeChainBuilder(audioContext);
}

/**
 * destructor
*/
WebAudio.NodeChainBuilder.prototype.destroy	= function(){
};

//////////////////////////////////////////////////////////////////////////////////
//		getters								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * getter for the nodes
*/
WebAudio.NodeChainBuilder.prototype.nodes	= function(){
	return this._nodes;
}

/**
 * @returns the first node of the chain
*/
WebAudio.NodeChainBuilder.prototype.first	= function(){
	return this._firstNode;
}

/**
 * @returns the last node of the chain
*/
WebAudio.NodeChainBuilder.prototype.last	= function(){
	return this._lastNode;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * add a node to the chain
 * @param {[type]} node       [description]
 * @param {[type]} properties [description]
 */
WebAudio.NodeChainBuilder.prototype._addNode	= function(node, properties)
{
	// update this._bufferSourceDst - needed for .cloneBufferSource()
	var lastIsBufferSource	= this._lastNode && ('playbackRate' in this._lastNode) ? true : false;
	if( lastIsBufferSource )	this._bufferSourceDst	= node;

	// connect this._lastNode to node if suitable
	if( this._lastNode !== null )	this._lastNode.connect(node);
	
	// update this._firstNode && this._lastNode
	if( this._firstNode === null )	this._firstNode	= node;
	this._lastNode	= node;
		
	// apply properties to the node
	for( var property in properties ){
		node[property]	= properties[property];
	}

	// for chained API
	return this;
};


//////////////////////////////////////////////////////////////////////////////////
//		creator for each type of nodes					//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Clone the bufferSource. Used just before playing a sound
 * @returns {AudioBufferSourceNode} the clone AudioBufferSourceNode
*/
WebAudio.NodeChainBuilder.prototype.cloneBufferSource	= function(){
	console.assert(this._nodes.bufferSource, "no buffersource presents. Add one.");
	var orig	= this._nodes.bufferSource;
	var clone	= this._context.createBufferSource()
	clone.buffer		= orig.buffer;
	clone.playbackRate	= orig.playbackRate;
	clone.loop		= orig.loop;
	clone.connect(this._bufferSourceDst);
	return clone;
}

/**
 * add a bufferSource
 *
 * @param {Object} [properties] properties to set in the created node
*/
WebAudio.NodeChainBuilder.prototype.bufferSource	= function(properties){
	var node		= this._context.createBufferSource()
	this._nodes.bufferSource= node;
	return this._addNode(node, properties)
};

/**
 * add a createMediaStreamSource
 *
 * @param {Object} [properties] properties to set in the created node
*/
WebAudio.NodeChainBuilder.prototype.mediaStreamSource	= function(stream, properties){
//	console.assert( stream instanceof LocalMediaStream )
	var node		= this._context.createMediaStreamSource(stream)
	this._nodes.bufferSource= node;
	return this._addNode(node, properties)
};

/**
 * add a createMediaElementSource
 * @param  {HTMLElement} element    the element to add
 * @param {Object} [properties] properties to set in the created node
 */
WebAudio.NodeChainBuilder.prototype.mediaElementSource = function(element, properties){
	console.assert(element instanceof HTMLAudioElement || element instanceof HTMLVideoElement)
	var node		= this._context.createMediaElementSource(element)
	this._nodes.bufferSource= node;
	return this._addNode(node, properties)
};

/**
 * add a panner
 * 
 * @param {Object} [properties] properties to set in the created node
*/
WebAudio.NodeChainBuilder.prototype.panner	= function(properties){
	var node		= this._context.createPanner()
	this._nodes.panner	= node;
	return this._addNode(node, properties)
};

/**
 * add a analyser
 *
 * @param {Object} [properties] properties to set in the created node
*/
WebAudio.NodeChainBuilder.prototype.analyser	= function(properties){
	var node		= this._context.createAnalyser()
	this._nodes.analyser	= node;
	return this._addNode(node, properties)
};

/**
 * add a gainNode
 *
 * @param {Object} [properties] properties to set in the created node
*/
WebAudio.NodeChainBuilder.prototype.gainNode	= function(properties){
	var node		= this._context.createGain()
	this._nodes.gainNode	= node;
	return this._addNode(node, properties)
};

