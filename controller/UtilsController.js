const crypto = require('crypto');
const GameController = require('./GameController');
const gameController = new GameController()
let games = {}
const SEED_COUNT = 1
const PITS_COUNT_PER_USER = 6
const PLAYER_1 = 'P1'
const PLAYER_2 = 'P2'

const swap = (value) => value == PLAYER_1 ? PLAYER_2 : PLAYER_1
const IsGameFinish = (result) => result.pits[PLAYER_1].every(item => item == 0) || result.pits[PLAYER_2].every(item => item == 0)

// Format the game object for visual
const setGamePeriod = (game) => {
    game["pitOrder"] = {}
    game["pitOrder"][PLAYER_1] = Object.assign(`${game.pits[PLAYER_1].join("  ")}`).split("").reverse().join("");
    game["pitOrder"][PLAYER_2] = `${game.pits[PLAYER_2].join("  ")}`;
    console.log('here');

    return game
}

const setRows = (rows) => {
    let games = {}
    rows.forEach(item => (
        games[item.game_id] = {
            gameID: item.game_id,
            pits: {
                [PLAYER_1]: item.player1_seeds.split(',').map(item => +item),
                [PLAYER_2]: item.player2_seeds.split(',').map(item => +item)
            },
            players: {
                [PLAYER_1]: item.player1_mancala,
                [PLAYER_2]: item.player1_mancala
            },
            currentPlayer: item.current_player
        }))
    return games;
}
const finishGame = async (gameID) => {
    // move the game information to other table
    await gameController.finishGame(gameID).catch(err => console.log(err))
    await gameController.deleteGame(gameID).catch(err => console.log(err))
    delete games[gameID]
}

/**
 * Compete the game result and get the winner
 * @param {*} game 
 * @returns 
 */
const calcGamePoints = (game) => {
    game.players[PLAYER_1] += game.pits[PLAYER_1].reduce((a, b) => a + b, 0)
    game.players[PLAYER_2] += game.pits[PLAYER_2].reduce((a, b) => a + b, 0)
    let score = {
        [PLAYER_1]: game.players[PLAYER_1],
        [PLAYER_2]: game.players[PLAYER_2]
    }
    game = {}
    game = score

    if (score[PLAYER_1] == score[PLAYER_2])
        game['result'] = 'DRAW!!'
    else
        game['winner'] = score[PLAYER_1] > score[PLAYER_2] ? PLAYER_1 : PLAYER_2
    return game;
}
class UtilsController {

    constructor() {
        gameController.getGames().then(response => {
            games = setRows(response);
        }).catch(err => console.log(err))
    }
}

/**
 * generate a new random gameID 
 * create new game object
 */
UtilsController.prototype.createNewGame = async (req, res, next) => {
    let gameID = crypto.randomBytes(20).toString('hex');
    //add new game in games array
    games[gameID] = await gameController.createNewGame(gameID).catch(err => console.log(err))
    res.json(games[gameID])
}

/**
 * This function checks if game exist
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
UtilsController.prototype.checkGame = async (req, res, next) => {
    let { gameID } = req.body
    let game = games[gameID]
    if (!game) return res.json({ message: 'Game cannot found !! ' })
    res.game = game
    next()
}


UtilsController.prototype.makeAttack = async (req, res, next) => {
    let game = res.game;
    let { currentPlayer: pitSide, pitNumber } = req.body
    // because of array indis
    pitNumber--;

    let pitBalance = Object.assign(game.pits[pitSide][pitNumber], {});
    game.pits[pitSide][pitNumber] = 0;
    let currentIndis = 0
    //start with next indis
    currentIndis = ++pitNumber

    // add every bit by pitBalance balance value
    for (let i = 1; i < pitBalance + 1; i++) {

        //check if user get point and not opponent point
        if (currentIndis == PITS_COUNT_PER_USER && pitSide == game.currentPlayer) {
            game.players[pitSide]++;
        }
        else if (currentIndis >= PITS_COUNT_PER_USER) { // change pit side if indis get out of box
            pitSide = swap(pitSide);
            currentIndis = 0;
            game.pits[pitSide][currentIndis] += 1;
        }
        else //add point for current indis
            game.pits[pitSide][currentIndis] += 1;

        currentIndis++
    }


    currentIndis--;
    // Find the opposite side of the pit : 1 - 6, 2 - 5, 3 - 4...
    let opponentIndis = PITS_COUNT_PER_USER - currentIndis - 1;

    // capture mode 
    if (game.pits[swap(game.currentPlayer)][opponentIndis] != 0
        && currentIndis != PITS_COUNT_PER_USER && game.pits[game.currentPlayer][currentIndis] == 1
        && pitSide == game.currentPlayer) {
        game.players[pitSide] += game.pits[game.currentPlayer][currentIndis];
        game.players[pitSide] += game.pits[swap(game.currentPlayer)][opponentIndis];

        game.pits[game.currentPlayer][currentIndis] = 0;
        game.pits[swap(game.currentPlayer)][opponentIndis] = 0;
    }
    if (currentIndis == PITS_COUNT_PER_USER || pitBalance == 0) {
        console.log('Play again');
    } else {
        //change game turn 
        game.currentPlayer = swap(game.currentPlayer)
    }
    gameController.attack(game,req.body).catch(err => console.log(err))
    next()

}

/**
 * Check if player turn is true
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
UtilsController.prototype.checkPlayerTurn = async (req, res, next) => {
    let { currentPlayer } = req.body
    if (currentPlayer != res.game.currentPlayer)
        return res.json({ message: 'Other Players Turn' })
    next()
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
UtilsController.prototype.checkGameStatus = async (req, res, next) => {
    let game = res.game;
    let isFinish = IsGameFinish(game)

    if (!isFinish)
        return res.json(setGamePeriod(game))

    // if game just finish
    let gameResult = calcGamePoints(game)
    finishGame(game.gameID)
    return res.json({ message: 'Game Over', gameResult })
}

UtilsController.prototype.listGames = async (req, res, next) => {
    games = setRows(await gameController.getGames())
    res.json(games)
}

module.exports = UtilsController;