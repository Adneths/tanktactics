/* eslint-disable @next/next/no-sync-scripts */
import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

function showHistory() {
	$('#history').show(0).animate({ "bottom": "0%", "top": "0%" }, 300);
}
function hideHistory() {
	$('#history').animate({ "bottom": "100%", "top": "-100%" }, 300).hide(0);
}
function showVote() {
	$('#vote').show(0).animate({ "bottom": "0%", "top": "0%" }, 300);
}
function hideVote() {
	$('#vote').animate({ "bottom": "100%", "top": "-100%" }, 300).hide(0);
}
function showHelp() {
	$('#help').show(0).animate({ "bottom": "0%", "top": "0%" }, 300);
}
function hideHelp() {
	$('#help').animate({ "bottom": "100%", "top": "-100%" }, 300).hide(0);
}

function useKeyPress(key, action) {
	useEffect(() => {
		function onKeyup(e) {
			if (e.key === key) action()
		}
		window.addEventListener('keyup', onKeyup);
		return () => window.removeEventListener('keyup', onKeyup);
	}, []);
}

var arr = [];
for (var i = 0; i < 200; i++)
	arr.push(i);

export default function Home() {
	const [update, setUpdate] = useState(false);
	const [version, setVersion] = useState(-1);
	const [boardState, setBoardState] = useState({});
	const [time, setTime] = useState(new Date());
	const [buttons, setButtons] = useState(-1);
	const [history, setHistory] = useState('');
	const [voteState, setVoteState] = useState({ count: {} });

	const increment = useCallback(() => {
		setTime(new Date())
	}, [setTime]);
	useEffect(() => {
		const r = setInterval(async () => {
			increment()

			var data = await fetch('/api/gamestate', {
				method: 'GET',
				headers: { type: 'version' }
			}).then(
				res => res.json()
			)
			setVersion(data.version);
		}, 1000)

		return () => {
			clearInterval(r)
		}
	}, [increment]);
	useEffect(() => {
		async function getData() {
			var data = await fetch('/api/gamestate', {
				method: 'GET',
				headers: { type: 'boardState', user: '' }
			}).then(
				res => res.json()
			)
			if (JSON.stringify(data) != '{}') {
				setBoardState(data);
			}
		}
		getData();
	}, [version, update])

	useKeyPress('1', () => setButtons(0));
	useKeyPress('2', () => setButtons(1));
	useKeyPress('3', () => setButtons(2));

	var players = {}
	var winner = undefined;
	if (boardState.players != undefined) {
		for (var p of boardState.players) {
			if (p.health > 0) {
				players[p.position] = p;
				if (winner === undefined)
					winner = p.name;
				else
					winner = -1;
			}
		}
	}
	else {
		return (<div className={styles.login}></div>)
	}

	var alives = [];
	if (boardState.players != undefined)
		for (var obj of boardState.players) {
			if (obj.health > 0)
				alives.push(obj.name);
		}

	return (
		<div className={styles.container}>
			<Head>
				<title>Tank Tactics</title>
				<meta name="description" content="Game" />
				<link rel="icon" href="/favicon.ico" />
				<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js" />
			</Head>
			<div className={styles.menubar}>
				<div className={styles.health}>
				</div>
				<div className={styles.energy}>
					{energyDisplay(time, 0)}
				</div>
			</div>
			<div className={styles.gameboard}>
				{arr.map((num) => {
					return getGridSquare(num, '', players, () => { }, boardState.position, buttons === 1 || buttons === 2, boardState.range)
				})}
			</div>
			<div className={styles.overlay} onClick={hideHistory} id="history" style={{ display: "none" }}><p className={styles.subtitle}>{history}</p></div>
			<div className={styles.overlayVote} onClick={hideVote} id="vote" style={{ display: "none" }}>{getVoteButtons(alives, voteState)}</div>
			<div className={styles.overlay} onClick={hideHelp} id="help" style={{ display: "none" }}>
				<p>
					<span className={styles.title}>How to Play</span><br />
					Every player starts with 3 HP (Health Point) and 0 AP (Action Point)<br />
					Every 24 hours every player gains 1 AP<br />
					APs can be spent on the actions below
					<div className={styles.subtitle}>
						Move to an adjecent tile<br />
						Attack another player &apos;in range&apos; damaging 1 HP<br />
						Gift the AP to another player &apos;in range&apos;<br />
					 	Heal yourself for 1 HP<br />
						Upgrade your range by 1 (starts at 2)<br />
						(A target is &apos;in range&apos; if both the vertical distance and horizontal distance is less or equal to the range)<br />
						<br />
						Move, Attack, Gift (Press button then press corresponding tile)<br />
						Heal, Upgrade (Press button for effect)<br />
						Hotkeys: 1 - Move, 2 - Attack, 3 - Gift
					</div><br />
					Dead players can vote to help the remaining players<br />
					Every 3 votes grant the player 1 extra AP<br />
					Votes are counted every 24 hours<br />
					<br />
					<span className={styles.title}>Last surving player is the winner</span>
				</p>
			</div>
			{
				winner === -1 || winner === undefined ? null :
					<div className={styles.login}>{winner} has won</div>
			}
			<footer>
				<a onClick={() => {
					async function getHistory() {
						var data = await fetch('/api/gamestate', {
							method: 'GET',
							headers: { type: 'history' }
						}).then(
							res => res.json()
						)
						setHistory(data.text);
					}
					getHistory();
					showHistory();
				}}>History</a>
				<a onClick={() => {
					async function getVoteState() {
						var data = await fetch('/api/votestate', {
							method: 'GET',
							headers: { user: '' }
						}).then(
							res => res.json()
						)
						setVoteState(data);
					}
					getVoteState();
					showVote();
				}}>Vote</a>
				<b>{null}</b>
				<a onClick={showHelp}>Help</a>
				<a></a>
			</footer>
		</div>
	)
}

function inRange(source, target, range) {
	if (source === target)
		return false;
	var x = Math.abs(source % 20 - target % 20);
	var y = Math.abs(Math.floor(source / 20) - Math.floor(target / 20));
	return x <= range && y <= range;
}

function getGridSquare(num, user, players, onClick, position, showRange, range) {
	var classType = players[num] === undefined || players[num].health === 0 ? showRange && inRange(position, num, range) ? styles.gridsquareBlue : styles.gridsquare : players[num].name === user ? styles.gridsquareGreen : styles.gridsquareYellow;
	//var classType = players[num] != undefined ? num === position ? styles.gridsquareGreen : players[num].health != 0 ? styles.gridsquareYellow : styles.gridsquare : styles.gridsquare;
	if (players[num] != undefined && players[num].health != 0) {
		return <div className={classType} onClick={onClick} key={num}>
			<div>{players[num].name}</div>
			<div className={styles.smallHealth}>{heartDisplay(players[num].health)}</div>
		</div>;
	}
	return <div className={classType} onClick={onClick} key={num}></div>;
}

function heartDisplay(health) {
	var ret = '';
	for (var i = 0; i < health; i++)
		ret += '♥';
	for (var i = 0; i < 3 - health; i++)
		ret += '♡';
	return ret;
}

function energyDisplay(time, energy) {
	var a = '';
	var b = '';
	var c = '';
	var d = '';
	for (var i = 0; i < energy && i < 5; i++)
		a += '●';
	for (var i = 0; i < 5 - a.length; i++)
		b += '●';
	for (var i = 5; i < energy && i < 10; i++)
		c += '●';
	for (var i = 0; i < 5 - c.length; i++)
		d += '●';

	return <div>
		<p className={styles.timeLeft}>
			{
				(23 - time.getUTCHours()).toString().concat(':', (59 - time.getUTCMinutes()).toString().padStart(2, '0'), ':', (59 - time.getUTCSeconds()).toString().padStart(2, '0'))
			}
		</p>
		<span className={styles.energyNone}>●●●●●</span><br />
		<span className={styles.energyNone}>●●●●●</span><br />
	</div>
}

function getVoteButtons(alives, state) {
	return (<div>Place your vote
		<p>{alives.map((name) => {
			return (<span key={name}>{name} - {state.count[name] === undefined ? 0 : state.count[name]}</span>);
		})}</p>
	</div>)
}