'use strict' ;

'use string';

const dayjs = require('dayjs');

function User(userId, type, username, name, surname){
    this.userId = userId;
    this.type = type;
    this.username = username;
    this.name = name;
    this.surname = surname;
}

function Block(blockId, content, position, pageId, type, pathId){
    this.blockId = blockId;
    this.content = content;
    this.position = position;
    this.pageId = pageId;
    this.type = type;
}

function Page(pageId,title, author,userId, creationDate, publicationDate){
    this.pageId = pageId; 
    this.title = title;
    this.author = author;
    this.userId = userId;
    this.creationDate = dayjs(creationDate).format('YYYY-MM-DD');
    this.publicationDate = dayjs(publicationDate).format('YYYY-MM-DD');
}


exports.User = User;
exports.Page = Page;
exports.Block = Block;

