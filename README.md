# MANCALA GAME
The mancala games are a family of two-player turn-based strategy board games played with small stones, beans, or seeds and rows of holes or pits in the earth, a board or other playing surface. The objective is usually to capture all or some set of the opponent's pieces. [Read more...](https://en.wikipedia.org/wiki/Mancala)



## Table Content 

- Setup
- Quick Start
- End Points
- Creator
## Setup
The project uses PostgreSQL and NodeJS. I used PostgreSQL on Docker container in this project. NodeJS version is v14.15.1
### Postgres
  - [Docker](https://hub.docker.com/_/postgres)
  - [PostgreSQl Download ](https://www.postgresql.org/download/)
### NodeJS
  - [Download](https://nodejs.org/en/)
 

## Quick Start
- Set the .env file in root directory according to DB information
- `npm install` <br>

Run `npm run start` for a dev server. Navigate to `http://localhost:3001/`. The app will automatically reload if you change

## End Points
  - `[GET]` http://localhost:3001/game/createNewGame 
     -  This endpoint going to create a new game with uniqe game id. 
     -  You should note that game id.
  - `[POST]` http://localhost:3001/game/attack
     -  This endpoint attacks by parameters.. here is the body parameters ; <br>
        ```json
          {
            "gameID":"xxxxxxxxxxx",
            "currentPlayer":"P1" // or "P2",
            "pitNumber":1 // 1 to 6
          }
        ```
  - `[GET]` http://localhost:3001/game/list 
     -  This endpoint lists all games currently playing.
## Creator

**Ramazan Kaya**

- <https://github.com/kayaramazan>
