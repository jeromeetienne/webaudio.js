tQuery.register('Planet', function(opts){
	this._opts	= opts = tQuery.extend(opts, {
		world		: tQuery.world,
		radiusOrbit	: 0,
		periodOrbit	: 1,
		axialTilt	: 0,
		scale		: 1
	});
	console.assert(opts.textureUrl);
	console.assert(opts.soundUrl);

	this._world	= opts.world;

	// material
	if( hiGlEnable ){
		var material	= new THREE.MeshPhongMaterial({
			ambient	: 0xFFFFFF,
			color	: 0x444444,
			map	: THREE.ImageUtils.loadTexture(opts.textureUrl)
		});
	}else{
		var material	= new THREE.MeshLambertMaterial({
			ambient	: 0xFFFFFF,
			color	: 0x444444,
			map	: THREE.ImageUtils.loadTexture(opts.textureUrl)
		});
	}

	// create a planet
	this._planet	= tQuery.createSphere(material).addTo(world).scale(opts.scale);

	// create a sound
	var sound	= this._sound = webaudio.createSound();
	// load sound.wav and play it
	sound.load(opts.soundUrl);


	this._planet.rotation(0,0, opts.axialTilt)
	this._planet.get(0).eulerOrder	= 'ZXY';
	
	this._object	= tQuery.createObject3D();
	this._object.add(this._planet);

	this._$update	= this._loopCb.bind(this);
	this._world.loop().hook(this._$update);
});

tQuery.Planet.prototype.destroy	= function(){
	this._world.loop().unhook(this._$update);	
};

tQuery.Planet.prototype.object3d	= function(){
	return this._object;
}
tQuery.Planet.prototype.planet	= function(){
	return this._planet;
}
tQuery.Planet.prototype.sound	= function(){
	return this._sound;
}

/**
*/
tQuery.Planet.prototype.tick	= function(){
	if( this._sound.isPlayable() ){
		this._sound.play();
	}
	return this;	// for chained API
}

tQuery.Planet.prototype._loopCb	= function(deltaTime, present)
{
	var radiusOrbit	= this._opts.radiusOrbit;
	var periodOrbit	= this._opts.periodOrbit;
	var angleOrbit	= present / periodOrbit * Math.PI * 2;
	var positionX	= Math.cos(angleOrbit) * radiusOrbit;
	var positionZ	= Math.sin(angleOrbit) * radiusOrbit;
	this._object.position(positionX,0,positionZ)

	this._planet.rotateY(0.01)
	
	// scale the planet depending on sound amplitude
	var amplitude	= this._sound.amplitude();
	var scale	= 0.1 + amplitude * 0.9;
	this._planet.scale(scale);
};