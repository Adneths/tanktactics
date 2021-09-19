import { getVoteState, doVote } from '../../lib/fileAccess'

export default async function handler(req, res) {
	if (req.method === 'GET') {
		const data = await getVoteState(req.headers.user);
		if (data != undefined) {
			res.status(200).json(data);
			return;
		}
		res.status(200).json({});
	}
	else if (req.method === 'PUT') {
		doVote(req.headers.name, req.headers.votee);
		res.status(200).json({});
	}
	else {
		res.status(400).json({});;
	}
}
