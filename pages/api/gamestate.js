import { getBoardState, getVersion, doAction, getHistory } from '../../lib/fileAccess'

export default async function handler(req, res) {
	if (req.method === 'GET') {
		var data;
		switch(req.headers.type)
		{
			case 'version':
				res.status(200).json({version: await getVersion()});
				return;
			case 'boardState':
				data = await getBoardState(req.headers.user);
				if (data != undefined) {
					res.status(200).json(data);
					return;
				}
				break;
			case 'history':
				data = await getHistory();
				res.status(200).json(data);
				return;
			case 'votes':
				break;
		}
		res.status(200).json({});
		/*const version = await getVersion();
		if (req.headers.version < version) {
			const data = await getBoardState(req.headers.user);
			if (data != undefined) {
				res.status(200).json(data);
				return;
			}
		}*/
	}
	else if (req.method === 'PUT') {
		switch(req.headers.button)
		{
			case '0':
				doAction('move', req.headers.name, req.headers.position);
				break;
			case '1':
				doAction('attack', req.headers.name, req.headers.position);
				break;
			case '2':
				doAction('gift', req.headers.name, req.headers.position);
				break;
			case '3':
				doAction('heal', req.headers.name, req.headers.position);
				break;
			case '4':
				doAction('upgrade', req.headers.name, req.headers.position);
				break;
			default:
		}
		res.status(200).json({});
	}
	else {
		res.status(400).json({});
	}
}
