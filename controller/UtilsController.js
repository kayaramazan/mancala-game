const crypto = require('crypto');
const GameController = require('./GameController');
const gameController = new GameController()
let games = {}
class UtilsController {

    constructor() {
        gameController.getGames().then(response => {
            games = response;
        }).catch(err => console.log(err))
    }
}


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

UtilsController.prototype.checkPlayerTurn = async (req, res, next) => {
    let game = res.game;
    let { gameID, pitSide:currentPlayer, pitNumber } = req.body
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

    if (game.pits[swap(game.currentPlayer)][opponentIndis] != 0
      && currentIndis != PITS_COUNT_PER_USER && game.pits[game.currentPlayer][currentIndis] == 1
      && pitSide == game.currentPlayer) {
      game.players[pitSide] += game.pits[game.currentPlayer][currentIndis];
      game.players[pitSide] += game.pits[swap(game.currentPlayer)][opponentIndis];

      game.pits[game.currentPlayer][currentIndis] = 0;
      game.pits[swap(game.currentPlayer)][opponentIndis] = 0;

      console.log("Aktarildi");
    }
    if (currentIndis == PITS_COUNT_PER_USER || pitBalance == 0) {
      console.log('Play again');
    } else {
      //change game turn 
      game.currentPlayer = swap(game.currentPlayer)
    }
    gameController.updateGame(game);
}
UtilsController.prototype.checkPlayerTurn = async (req, res, next) => {
    let { currentPlayer } = req.body
    if (currentPlayer != res.game.currentPlayer)
        return res.json({ message: 'Other Players Turn' })
    next()
}
module.exports = UtilsController;