
const crypto = require('crypto');
const db = require('../db');
const SEED_COUNT = 1
const PITS_COUNT_PER_USER = 6
const PLAYER_1 = 'P1'
const PLAYER_2 = 'P2'
const chooseRandomFirstPlayer = () => Math.round(Math.random()) ? PLAYER_1 : PLAYER_2

class GameController {

}

GameController.prototype.getGames = () =>
    new Promise((res, rej) => {
        db.query("SELECT * FROM TBL_GAME", (err, response) => {
            if (err) rej(err)
            res(response.rows)

        })
    })


GameController.prototype.createNewGame = (gameID) =>
    new Promise((res, rej) => {
        let game = {
            gameID,
            pits: {
                [PLAYER_1]: Array(PITS_COUNT_PER_USER).fill(SEED_COUNT),
                [PLAYER_2]: Array(PITS_COUNT_PER_USER).fill(SEED_COUNT)
            },
            players: { [PLAYER_1]: 0, [PLAYER_2]: 0 },
            player1Cup: 0,
            player2Cup: 0,
            currentPlayer: chooseRandomFirstPlayer()
        }
        if (db) {
            db.query(`INSERT INTO tbl_game(
                game_id, seed_count, player1_seeds, player2_seeds, player1_mancala, player2_mancala, current_player)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    game.gameID,
                    SEED_COUNT,
                    game.pits[PLAYER_1].join(','),
                    game.pits[PLAYER_2].join(','),
                    game.players[PLAYER_1],
                    game.players[PLAYER_1],
                    game.currentPlayer
                ], (err, response) => {
                    if (err) rej(err)
                    res(game)
                })
        }
        else
            rej('DB not found!!')
    })
GameController.prototype.updateGame = (game) =>
    new Promise((res, rej) => {
        if (db) {
            db.query(`UPDATE tbl_game
                SET game_id=$1, player1_seeds=$2, player2_seeds=$3, player1_mancala=$4, player2_mancala=$5, current_player=$6
                WHERE game_id=$7`, [
                game.gameID,
                game.pits[PLAYER_1].join(','),
                game.pits[PLAYER_2].join(','),
                game.players[PLAYER_1],
                game.players[PLAYER_2],
                game.currentPlayer,
                game.gameID
            ], (err, response) => {
                if (err) rej(err)


            })
        }

    })
GameController.prototype.deleteGame = (gameID) =>
    new Promise((res, rej) => {
        if (db) {
            db.query("DELETE FROM TBL_GAME WHERE game_id = $1", [gameID], (err, response) => {
                if (err) rej(err)
                console.log('deleted', response);
                res(response)
            })
        }

    })
GameController.prototype.finishGame = (gameID) =>
    new Promise((res, rej) => {
        if (db) {
            db.query("INSERT INTO TBL_GAME_FINISH SELECT * FROM TBL_GAME WHERE game_id=$1", [gameID], (err, response) => {
                if (err) rej(err)
                res(response)

            })
        }

    })

GameController.prototype.attack = (game, body) => {
    let gameController = new GameController()
    gameController.updateGame(game, body)
    let { currentPlayer: pitSide, pitNumber } = body
    console.log(pitSide, pitNumber)
    return new Promise((res, rej) => {
        db.query("INSERT INTO ATTACK (GAME_ID,ATTACKER_PLAYER,PIT_NUMBER)VALUES($1,$2,$3)", [game.gameID, pitSide, pitNumber], (err, response) => {
            if (err) rej(err)
            res(response)

        })

    })
}


module.exports = GameController;