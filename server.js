/*var http = require('http'),
	fs = require('fs'),
	serv = http.createServer(function (req, res) {
		res.writeHead(200, {'Content-Type': 'html'});
		fs.readFile('test.html', function (err, data) {
			if (err) throw err;
			res.end(data);
		});
	}),
	io = require('socket.io').listen(serv);

serv.listen(1337, '127.0.0.1');
serv.on('connection', function (socket) {
	console.log('someone connected!');
	socket.emit("news",{id:"anamefdas"});
	socket.on('call',function(){
		console.log("Response!");
	})
});
console.log('Server running at http://127.0.0.1:1337/');*/
var app = require('http').createServer(handler),
	 io = require('socket.io').listen(app),
	 fs = require('fs'),
	 path = require('path');

app.listen(1337, '192.168.1.66');

function handler (request, response) {
		console.log('request starting...');
		var filePath = '.' + request.url;
		if (filePath == './')
				filePath = './index.htm';
				 
		var extname = path.extname(filePath);
		var contentType = 'text/html';
		switch (extname) {
				case '.js':
						contentType = 'text/javascript';
						break;
				case '.css':
						contentType = 'text/css';
						break;
		}
		 
		path.exists(filePath, function(exists) {
				if (exists) {
						fs.readFile(filePath, function(error, content) {
								if (error) {
										response.writeHead(500);
										response.end();
								}
								else {
										response.writeHead(200, { 'Content-Type': contentType });
										response.end(content, 'utf-8');
								}
						});
				}
				else {
						response.writeHead(404);
						response.end();
				}
		});
}

var Player = function(){
	this.id = Player.count++;
	this.position = {x:0,y:0,z:20};
	this.socket = null;
}
Player.count = 0;

var players = [];
io.sockets.on('connection', function (socket) {
	var newPlayer = new Player();
	//newPlayer.socket = socket;
	/*for(var i=0;i<players.length;i++)
		if(players[i].id != i)
			newPlayer.id = i;
*/
	console.log("Socket session: started player " + newPlayer.id );

	players.push(newPlayer);
	socket.emit('start', { 'id': newPlayer.id, 'players': players });
	socket.on('cll', function (accepted) {
		if(accepted){
			console.log("Socket session: added new Player.");
			io.sockets.emit('add', newPlayer);
		}
		else {
			players.splice(newPlayer.id,1);
			console.log("Socket session: added new Player faild!.");
		}
	});
	socket.on('disconnect', function() {
		var id = newPlayer.id;
		console.log("Socket session: ended player " + newPlayer.id);
		for(var i=0;i<players.length;i++)
			if(players[i].id == id){
				delete players[i];
				players.splice(i,1);
			}
		io.sockets.emit('remove', id);
	});

	socket.on('request-position-change', function(id, pos){
		for(var i=0;i<players.length;i++)
			if(players[i].position.x == pos.x && players[i].position.y == pos.y){// && players[i].position.z == pos.z){
				console.log(pos,players[i].position);
				for(var j=0;j<players.length;j++)
					if(players[j].id == id){
						io.sockets.emit('position-change', id, players[j].position);
						return;
					}
			}
		for(var i=0;i<players.length;i++)
			if(players[i].id == id){
				players[i].position.x = pos.x;
				players[i].position.y = pos.y;
				players[i].position.z = pos.z;
			}
		io.sockets.emit('position-change', id, pos);
		return;
	});

	socket.on('request-user-message',function(id,msg){
		for(var i in players)
			if( players[i].id == id){
				console.log("Player " + id + " sends message: ", msg);
				io.sockets.emit('user-message',id,msg);
				return;
			}
	});

	console.log("Socket session: Current playerCount: " + players.length);
});