const users = [];

const addUser = ({id, username, room}) => {
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	// validation
	if (!username || !room) {
		return {
			error: 'username and room are required'
		}
	}

	// check for existing user
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username
	});
	if (existingUser) {
		return {
			error: 'Username already exist'
		}
	}

	//store user
	const user = {id, username, room};
	users.push(user);
	return {user};
};

const removeUser = (id) => {
	const index = users.findIndex((user) => {
		return user.id === id;
	});
	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

const getUser = (id) => {
	const user = users.find((user) => {
		return user.id === id;
	});
	return user;
};

const getUsersInRoom = (room) => {
	room = room.trim().toLowerCase();
	const roomUsers = users.filter((user) => {
		return user.room === room;
	});
	return roomUsers;
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
}