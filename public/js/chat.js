const socket = io(); // connect to server

const messages_div = document.querySelector('#messages');
const message_template = document.querySelector('#message-template').innerHTML;
const location_template = document.querySelector('#location-template').innerHTML;
const sidebar_template = document.querySelector('#sidebar-template').innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
	// new message element
	const newMessage = messages_div.lastElementChild;

	// height of new message
	const newMessageStyles = getComputedStyle(newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

	// visible height
	const visibleHeight = messages_div.offsetHeight;

	// height of message container
	const containerHeight = messages_div.scrollHeight;

	// How far have i scrolled
	const scrollOffset = messages_div.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		messages_div.scrollTop = messages_div.scrollHeight;
	}
}
socket.on('message', (msg) => {
	const html = Mustache.render(message_template, {
		username: msg.username,
		message: msg.text,
		createdAt: moment(msg.createdAt).format('h:mm a')
	});
	messages_div.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

const form = document.querySelector('form');
const input = document.querySelector('input');
const button = document.querySelector('button');
form.addEventListener('submit', (e) => {
	e.preventDefault();
	button.setAttribute('disabled', 'disabled');
	const message = input.value;
	socket.emit('sendMessage', message, (ack_msg) => {
		button.removeAttribute('disabled');
		input.value = '';
		input.focus();
		console.log('message was delivered', ack_msg);
	});
});

const location_btn = document.querySelector('#send_location');

location_btn.addEventListener('click', () => {
	if(!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}

	location_btn.setAttribute('disabled', 'disabled');
	navigator.geolocation.getCurrentPosition((position) => {
		const position_obj = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
		}
		socket.emit('sendLocation', position_obj, () => {
			location_btn.removeAttribute('disabled');
			console.log('Location shared');
		});
	});
});

socket.on('locationMessage', (location) => {
	const html = Mustache.render(location_template, {
		username: location.username,
		url: location.url,
		createdAt: moment(location.createdAt).format('h:mm a')
	});
	messages_div.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', ({room, users}) => {
	const html = Mustache.render(sidebar_template, {
		room,
		users
	});
	document.querySelector('#sidebar').innerHTML = html;
});

socket.emit('join', {
	username,
	room
}, (error) => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});