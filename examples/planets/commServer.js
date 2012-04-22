var socket = io.connect('http://127.0.0.1:8001');
//var socket = io.connect('http://192.168.43.130:8000');

socket.on('handshake', function(data){
	console.log(data);
	socket.emit('handshake', { my: navigator.userAgent });
});

socket.on('pendulum', function (event) {
	if( typeof(captors) === "undefined" )	return;
	Object.keys(event).forEach(function(captor){
		var value	= captors[captor];
		console.log("captor", captor, "value", value);
		var object	= captors[captor];
		object && object.tick();
	})
});
