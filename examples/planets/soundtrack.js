function soundtrackCreate(){
	// create a sound
	//var url	= 'sounds/techno.mp3';
	var url		= '../sounds/perfume.mp3';
	//var url	= 'sounds/eatpill.mp3'
	var sound	= webaudio.createSound().load(url, function(sound){
		sound.loop(true).play();
	});
	return sound;
};
