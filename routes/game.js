var express = require('express'); 
const UtilsController = require('../controller/UtilsController');
var router = express.Router();
let utils = new UtilsController() 

// user can create a new game via GET request
router.get('/createNewGame', utils.createNewGame);

//attack the exist game
router.post('/attack', utils.checkGame, utils.checkPlayerTurn, utils.makeAttack, utils.checkGameStatus);

//list whole games
router.get('/list',utils.listGames)

module.exports = router;
