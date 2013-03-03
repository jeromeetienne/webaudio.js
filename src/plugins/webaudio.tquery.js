/**
 * @fileoverview WebAudio.js plugin for tQuery
*/
tQuery.World.registerInstance('enableWebAudio', function(){
	// sanity check
	console.assert( this.hasWebAudio() === false, "there is already a webaudio" );
	// intenciate a tQuery.World.WebAudio
	var webaudio	= new WebAudio();
	// follow the listener
	var world	= this;
	webaudio.followListener(world);
	// store webaudio in the world
	tQuery.data(this, "webaudio", webaudio);
	// for chained API
	return this;
});

tQuery.World.registerInstance('disabledWebAudio', function(){
	if( this.hasWebAudio() === false )	return this;
	var webaudio	= tQuery.data(this, "webaudio");
	webaudio.destroy();
	tQuery.removeData(this, "webaudio");
	return this;	// for chained API
});

tQuery.World.registerInstance('getWebAudio', function(){
	var webaudio	= tQuery.data(this, "webaudio");
	return webaudio;
});

tQuery.World.registerInstance('hasWebAudio', function(){
	var webaudio	= tQuery.data(this, "webaudio");
	return webaudio ? true : false;
});

tQuery.World.registerInstance('supportWebAudio', function(){
	return WebAudio.isAvailable;
});

tQuery.registerStatic('createSound', function(world, nodeChain){
	world	= world || tQuery.world;
	return new WebAudio.Sound(world.getWebAudio(), nodeChain);
});


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

WebAudio.fn.followListener	= function(world){
	this._$followListenerCb	= function(deltaTime){
		this._followListenerCb(world.tCamera(), deltaTime);
	}.bind(this);
	world.loop().hook(this._$followListenerCb);
}

WebAudio.fn.unfollowListener	= function(world){
	// unhook this._updateCb from this.world.loop()
	world.loop().unhook(this._$followListenerCb);
	this._$followListenerCb	= null;
}

WebAudio.fn._followListenerCb	= function(object3d, deltaTime){
	var context	= this._ctx;
	// sanity check on parameters
	console.assert( object3d instanceof THREE.Object3D );
	console.assert( typeof(deltaTime) === 'number' );

	// ensure object3d.matrixWorld is up to date
	object3d.updateMatrixWorld();

	var matrixWorld	= object3d.matrixWorld;
	////////////////////////////////////////////////////////////////////////
	// set position
	var position	= new THREE.Vector3().getPositionFromMatrix(matrixWorld);
	context.listener.setPosition(position.x, position.y, position.z);

	////////////////////////////////////////////////////////////////////////
	// set orientation
	var mOrientation= matrixWorld.clone();
	// zero the translation
	mOrientation.setPosition({x : 0, y: 0, z: 0});
	// Compute Front vector: Multiply the 0,0,1 vector by the world matrix and normalize the result.
	var vFront= new THREE.Vector3(0,0,1);
	vFront.applyMatrix4(mOrientation)
	vFront.normalize();
	// Compute UP vector: Multiply the 0,-1,0 vector by the world matrix and normalize the result.
	var vUp= new THREE.Vector3(0,-1, 0);
	vUp.applyMatrix4(mOrientation)
	vUp.normalize();
	// Set panner orientation
	context.listener.setOrientation(vFront.x, vFront.y, vFront.z, vUp.x, vUp.y, vUp.z);

	////////////////////////////////////////////////////////////////////////
	// set velocity
	if( this._prevPos === undefined ){
		this._prevPos	= new THREE.Vector3().getPositionFromMatrix(matrixWorld);
	}else{
		var position	= new THREE.Vector3().getPositionFromMatrix(matrixWorld);
		var velocity	= position.clone().sub(this._prevPos).divideScalar(deltaTime);
		this._prevPos	= position.clone();
		context.listener.setVelocity(velocity.x, velocity.y, velocity.z);
	}
}


