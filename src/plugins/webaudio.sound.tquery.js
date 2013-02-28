
/**
 * follow a object3D
*/
WebAudio.Sound.fn.follow	= function(object3d, world){
	// parameter polymorphism
	world	= world	|| tQuery.world;
	// sanity check
	console.assert( this.isFollowing() === false );
	// handle parameter
	if( object3d instanceof tQuery.Object3D ){
		console.assert(object3d.length === 1)
		object3d	= object3d.get(0);
	}
	// sanity check on parameters
	console.assert( object3d instanceof THREE.Object3D );

	// hook the world loop
	this._followCb		= function(deltaTime){
		this.updateWithObject3d(object3d, deltaTime);
	}.bind(this);
	world.loop().hook(this._followCb);
	// for chained API
	return this;
}

/**
 * unfollow the object3D if any
*/
WebAudio.Sound.fn.unfollow	= function(world){
	this._world.loop().unhook(this._followCb);
	this._followCb		= null;
	// for chained API
	return this;
}

/**
 * @returns {Boolean} true if this sound is following a object3d, false overwise
*/
WebAudio.Sound.prototype.isFollowing	= function(){
	return this._followCb ? true : false;
	// for chained API
	return this;
}
