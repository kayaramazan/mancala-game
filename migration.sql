DROP TABLE TBL_GAME;
DROP TABLE ATTACK;
DROP TABLE TBL_GAME_finish;
create table TBL_GAME ( 
game_id varchar(50) primary key,
seed_count int not null,
created_date  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
alter table tbl_game add column player1_seeds varchar(20);
alter table tbl_game add column player2_seeds varchar(20);
alter table tbl_game add column player1_mancala int;
alter table tbl_game add column player2_mancala int;
alter table tbl_game add column current_player varchar(50);
create table tbl_game_finish (like tbl_game including all);
create table ATTACK ( 
game_id varchar(50),
attacker_player varchar(50),
pit_number int not null,
attack_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);