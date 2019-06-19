const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');
const http = require('http');
const express = require('express');
const port = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);
const path = require('path');

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
	console.log('New websocket connection');

	socket.on('sendMessage', (msg, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit('message', generateMessage(user.username, msg));
		callback('delivered');
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		if (user) {
			console.log(user);
			io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`));	
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			});
		}
	});

	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
		callback();
	});

	socket.on('join', (options, callback) => {
		const {error, user} = addUser({
			id: socket.id,
			...options
		});

		if (error) {
			return callback(error);
		}
		socket.join(user.room);
		socket.emit('message', generateMessage('Admin', 'Welcome!'));
		socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`));
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});
		callback();
	});
})

server.listen(port, () => {
	console.log('Server is up on port ' + port);
});