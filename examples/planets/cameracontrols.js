function initCameraControls(world)
{
	var controls	= new THREEx.DragPanControls(world.camera());

	//var controls	= new THREE.FirstPersonControls(world.camera());
	//var controls	= new THREE.TrackballControls(world.camera());

	world.setCameraControls(controls);
}