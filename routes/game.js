const crypto = require('crypto');
var express = require('express');
const GameController = require('../controller/GameController');
const UtilsController = require('../controller/UtilsController');

var router = express.Router();
const SEED_COUNT = 1
const PITS_COUNT_PER_USER = 6
const PLAYER_1 = 'P1'
const PLAYER_2 = 'P2'
let gameController = new GameController()
let utils = new UtilsController()
let games = gameController.getGames()
const swap = (value) => value == PLAYER_1 ? PLAYER_2 : PLAYER_1

const createNewGame = async (gameID) => {
  games[gameID] = await gameController.createNewGame(gameID).catch(err => console.log(err))
  //add new game in games array
  return games[gameID]
}

const setGamePeriod = (game) => {
  game["pitOrder"] = {}
  game["pitOrder"][PLAYER_1] = Object.assign(`${game.pits[PLAYER_1].join("  ")}`).split("").reverse().join("");
  game["pitOrder"][PLAYER_2] = `${game.pits[PLAYER_2].join("  ")}`;
  console.log('here');

  return game
}
const finishGame = async (gameID) => {
  await gameController.finishGame(gameID).catch(err => {
    console.log(err)
  })
  await gameController.deleteGame(gameID).catch(err => {
    console.log(err)
  })
  delete games[gameID]
}
const makeAttack = (game, pitSide, pitNumber) => {
  // Player turn control
  if (pitSide == game.currentPlayer) {
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
  } else {
    return 1
  }
}

const calcGamePoints = (game) => {
  game.players[PLAYER_1] += game.pits[PLAYER_1].reduce((a, b) => a + b, 0)
  game.players[PLAYER_2] += game.pits[PLAYER_2].reduce((a, b) => a + b, 0)
  let score = {
    [PLAYER_1]: game.players[PLAYER_1],
    [PLAYER_2]: game.players[PLAYER_2]
  }
  game = {}
  game = score
  console.log(score[PLAYER_1], '==', score[PLAYER_2]);
  if (score[PLAYER_1] == score[PLAYER_2])
    game['result'] = 'DRAW!!'
  else
    game['winner'] = score[PLAYER_1] > score[PLAYER_2] ? PLAYER_1 : PLAYER_2
  return game;
}
const IsGameFinish = (result) => result.pits[PLAYER_1].every(item => item == 0) || result.pits[PLAYER_2].every(item => item == 0)


/**
 * generate a new random
 * create new game object
 */
// router.get('/createNewGame', async function (req, res, next) {
//   // creates random id 
//   let gameID = crypto.randomBytes(20).toString('hex');
//   let game = await createNewGame(gameID)
//   res.json(game)
// });

router.get('/createNewGame',utils.createNewGame)
router.post('/attack',utils.checkGame,checkPlayerTurn,utils.makeAttack)

router.post('/attack', function (req, res, next) {
  let { gameID, currentPlayer, pitNumber } = req.body

  let game = games[gameID]
  if (!game) return res.json({ message: 'Game cannot found !! ' })
  let gameObj = game // new GameController(game)

  let result = makeAttack(game, currentPlayer, --pitNumber)
  if (result == 1) return res.json({ message: 'Other Players Turn' })

  let isFinish = IsGameFinish(gameObj)

  if (!isFinish) {
    return res.json(setGamePeriod(gameObj))
  }
  else {
    let gameResult = calcGamePoints(gameObj)
    finishGame(gameObj.gameID)
    return res.json({ message: 'Game Over', gameResult })
  }
});

router.get('/list', async (req, res, next) => {
  games = await gameController.getGames()
  res.json(games)
})
module.exports = router;
