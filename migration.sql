DROP TABLE TBL_GAME;
DROP TABLE ATTACK;
create table TBL_GAME ( 
id varchar(50) primary key,
seed_count int not null,
date timestamp
);
alter table tbl_game add column player1_seeds varchar(20);
alter table tbl_game add column player2_seeds varchar(20);
alter table tbl_game add column player1_mancala varchar(20);
alter table tbl_game add column player2_mancala varchar(20);
alter table tbl_game add column current_player int;

create table ATTACK ( 
game_id varchar(50) primary key,
attacker_player int not null,
pit_number int not null,
date timestamp
);