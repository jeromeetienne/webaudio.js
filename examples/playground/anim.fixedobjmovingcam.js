console.assert( tAnim.plugins['fixedObjMovingCam'] === undefined );
tAnim.plugins['fixedObjMovingCam']	= {
	init	: function(){
		var world	= tQuery.world;
		world.removeCameraControls();

		tQuery('torus').position(0,1.3,0).rotation(0,0,0);		
		world.tCamera().position.set(0, 0, 4).normalize().multiplyScalar(4);
		world.tCamera().lookAt(new THREE.Vector3(0, 0, 0));
	},
	destroy	: function(){
		
	},
	update	: function(deltaTime, present){
		var angle	= 0.3 * present * Math.PI * 2;
		var object	= world.tCamera();
		var radiusX	= 5;
		var radiusZ	= 10;
		object.position.set(Math.cos(angle)*radiusX, 1.5, Math.sin(angle)*radiusZ + radiusZ*0);
	}
};