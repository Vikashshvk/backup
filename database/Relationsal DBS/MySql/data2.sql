CREATE DATABASE if not exists instagram;
use instagram;
CREATE TABLE  USER(
ID INT,
age int,
NAME VARCHAR(30) not null ,
EMAIl VARCHAR(30),
FOLLOWERS INT default 0,
FOLLOWING INT,
constraint age_check check (age>=13),
PRIMARY KEY (ID)
);
 -- How to insert into table 
 insert into user
 (id,age,name,email,followers,following)
 values
 (1,14,"adam","adam@yahoo.in",123,145),
 (2,15,"bob","bob123@gmail.com",123,145),
 (3,16,"casey","casey@email.com",123,145),
 (4,17,"donald","donald@gmail.com",123,145);
CREATE TABLE POST(
ID INT primary KEY,
CONTENT VARCHAR(30),
USER_ID int,
FOREIGN KEY (USER_ID) REFERENCES USER(ID)
);
