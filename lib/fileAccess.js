const serverURI = 'http://3.34.93.114:8080';

export async function getBoardState(user) {
	var data = await fetch(serverURI, {
		method: 'GET',
		headers: { type: 'boardstate' }
	}).then(
		res => res.json()
	)
	if (data.time != undefined) {
		fetch(serverURI, {
			method: 'POST',
			headers: { name: user }
		})
		return data;
	}
	delete data.votes;
	for (var i = 0; i < data.players.length; i++) {
		if (data.players[i].name === user) {
			data.energy = data.players[i].energy
			data.health = data.players[i].health
			data.range = data.players[i].range
			data.position = data.players[i].position
		}
		delete data.players[i].energy;
		delete data.players[i].range;
	}
	return data;
}

export async function getVersion() {
	const data = await fetch(serverURI, {
		method: 'GET',
		headers: { type: 'version' }
	}).then(
		res => res.json()
	)
	return data.version;
}

export function doAction(action, name, position) {
	fetch(serverURI, {
		method: 'PUT',
		headers: {
			type: action,
			name: name,
			position: position
		}
	})
}

export function doVote(name, votee) {
	fetch(serverURI, {
		method: 'PUT',
		headers: {
			type: 'vote',
			name: name,
			votee: votee
		}
	})
}

export async function getVoteState(user) {
	var data = await fetch(serverURI, {
		method: 'GET',
		headers: { type: 'votes' }
	}).then(
		res => res.json()
	)
	var count = {};
	for (var key of Object.keys(data))
		if (count[data[key]] === undefined)
			count[data[key]] = 1;
		else
			count[data[key]]++;
	return { user: data[user], count: count };
}

export async function getHistory() {
	var data = await fetch(serverURI, {
		method: 'GET',
		headers: { type: 'history' }
	}).then(
		res => res.json()
	)
	return data;
}

export function register(user) {
	fetch(serverURI, {
		method: 'POST',
		headers: { name: user }
	})
}

export async function checkRegister(user) {
	var data = await fetch(serverURI, {
		method: 'GET',
		headers: { type: 'registered', name: user }
	}).then(
		res => res.json()
	)
	return data;
}