tQuery.register('Planet', function(opts){
	this._opts	= opts = tQuery.extend(opts, {
		world		: tQuery.world,
		radiusOrbit	: 0,
		periodOrbit	: 1,
		axialTilt	: 0,
		scale		: 1
	});
	console.assert(opts.textureUrl);

	this._world	= opts.world;
	// create a planet
	this._planet	= tQuery.createSphere();
	//this._planet.material(new THREE.MeshLambertMaterial({
	this._planet.material(new THREE.MeshPhongMaterial({
		ambient	: 0xFFFFFF,
		color	: 0x444444,
		map	: THREE.ImageUtils.loadTexture(opts.textureUrl)
	})).addTo(world).scale(opts.scale);


	this._planet.rotation(0,0, opts.axialTilt)
	this._planet.get(0).eulerOrder	= 'ZXY';
	
	this._object	= tQuery.createObject3D();
	this._object.add(this._planet);

	
	this._$update	= this._update.bind(this);
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

tQuery.Planet.prototype._update	= function(deltaTime, present)
{
	var radiusOrbit	= this._opts.radiusOrbit;
	var periodOrbit	= this._opts.periodOrbit;
	var angleOrbit	= present / periodOrbit * Math.PI * 2;
	var positionX	= Math.cos(angleOrbit) * radiusOrbit;
	var positionZ	= Math.sin(angleOrbit) * radiusOrbit;
	this._object.position(positionX,0,positionZ)

	this._planet.rotateY(0.01)
};