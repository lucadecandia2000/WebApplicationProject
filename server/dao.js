'use strict' ; 

const { Page, User, Block } = require('./model');

const dayjs = require('dayjs') ; 
const sqlite = require('sqlite3');
const crypto = require('crypto');

const db = new sqlite.Database('cms.sqlite', (err) => {
    if (err) throw err;
    db.run('PRAGMA foreign_keys = ON;', (error) => {
        if (error) throw error;
    });
});

/*
TO GET THE USER AND VALIDATE IT
*/
function getUser(username, password) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username=?';
        db.get(sql, [username], (err, row) => {
            if (err) { // database error
                reject(err);
            } else {
                if (!row) { // non-existent user
                    reject('Invalid username or password');
                } else {
                    crypto.scrypt(password, row.salt, 32, (err, computed_hash) => {
                        if (err) { // key derivation fails
                            reject(err);
                        } else {
                            const equal = crypto.timingSafeEqual(computed_hash, Buffer.from(row.password, 'hex'));
                            if (equal) { // password ok
                                resolve(row);
                            } else { // password doesn't match
                                reject('Invalid username or password');
                            }
                        }
                    });
                }
            }
        });
    });
}

function getAll ( ) {
    return new Promise ((resolve, reject) => {
        const sql = 'SELECT * from pages' ; 
        db.all(sql, (err,rows) =>{
            if(err) {
                reject(err) ; 
            }else {
                const pages = rows.map ((p)=> new Page(p.pageId, p.title, p.author, p.userId, dayjs(p.creationDate) , dayjs(p.publicationDate))) ; 
                resolve(pages) ; 
            }
        })
    })
}

function getAllPub () {
    const date = dayjs().format('YYYY-MM-DD');
    return new Promise ((resolve, reject) => {
        const sql = 'SELECT * from pages WHERE ? >= pages.publicationDate' ; 
        db.all(sql,[date], (err,rows) =>{
            if(err) {
                reject(err) ; 
            }else {
                const pages = rows.map ((p)=> new Page(p.pageId, p.title, p.author, p.userId, dayjs(p.creationDate) , dayjs(p.publicationDate))) ; 
                resolve(pages) ; 
            }
        })
    })
}


function getBlocksOnPageID ( id ) {
    return new Promise ((resolve, reject) => {
        const sql = 'SELECT * from blocks WHERE pageId = ?' ; 
        db.all(sql, [id], (err,rows)=>{
            if(err){
                reject(err) ; 
            } else {
                const blocks = rows.map((b)=> new Block(b.blockId, b.content , b.position , b.pageId , b.type , b.pathId))
                resolve(blocks) ; 
            }
        })
    })
}
function getBlocksOnPublishedPageID ( id ) {

    const date = dayjs().format('YYYY-MM-DD  HH::mm::ss');

    return new Promise ((resolve, reject) => {
        const sql = 'SELECT * from blocks,pages WHERE blocks.pageId == pages.pageId AND pages.pageId = ? AND pages.publicationDate <= ?' ; 
        db.all(sql, [id,date], (err,rows)=>{
            if(err){
                reject(err) ; 
            } else {
                const blocks = rows.map((b)=> new Block(b.blockId, b.content , b.position , b.pageId , b.type , b.pathId))
                resolve(blocks) ; 
            }
        })
    })
}

function createBlock(block){
    return new Promise((resolve,reject) => {
        const sql = 'INSERT INTO blocks(content,position,pageId,type,pathId) VALUES(?,?,?,?,?)';
        db.run(
            sql,
            //Id is autoincremental
            [block.content,block.position,block.pageId,block.type,block.pathId],
            (err) => {
                if(err){
                    reject(err.message);
                }else{
                    resolve(true);
                }
            })
    });
}


//UPDATE POSITION FUNCTION
function updatePositions(position, blockId){
    return new Promise((resolve,reject) => {
        const sql = "UPDATE blocks SET position = ? WHERE blockId = ?";
        db.run(sql, [position, blockId], (err) => {
            if (err){
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
//DELETE FUNCTIONS

//DELETE PAGE
function deletePage(id){
    
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM pages WHERE pageId = ?';
        db.run(sql, [id], (err) => {
            if (err){
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}

async function updateBlocks(list) {
    return new Promise((resolve, reject) => {
        list.forEach((block) => {
            console.log(block);
            const sql = "UPDATE blocks SET position = ?, content = ? WHERE blockId = ?"
            db.run(sql,[block.position, block.content, block.blockId], (err) =>{
                if(err){
                    reject(err);
                }else{
                    resolve(true);
                }
            })
        })
    });
}

async function addBlocks(list) {
    return new Promise((resolve, reject) => {
        list.forEach((block) => {
            // Perform operations on the element
            const sql = 'INSERT INTO blocks(content,position,pageId,type,pathId) VALUES (?,?,?,?,?)';
            db.run(sql, [block.content,block.position,block.pageId,block.type,block.pathId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });

    });
}

async function deleteBlock(list) {
    return new Promise((resolve, reject) => {
        list.forEach((block) => {
            const sql = 'DELETE FROM blocks WHERE blockId = ?';
            db.run(sql, [block.blockId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });

    });
}

async function getAllUsers(){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users';
        db.all(sql,(err,row) => {
            if(err) {
                reject(err);
            }else{
                const users = row.map((u) => new User(
                    u.userId,
                    u.type,
                    u.username,
                    u.name,
                    u.surname
                ));
                resolve(users);
            }
        });
    });
}

function updatePage(pageId, title, author, publicationDate) {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE pages SET title = ?, author = ?, publicationDate = ? WHERE pageId = ?";
        db.run(sql, [title, author, publicationDate, pageId], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
function createPage(p) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO pages(title, userId, author, creationDate, publicationDate) VALUES (?,?,?,?,?)';
        db.run(sql, [p.title, p.userId, p.author, p.creationDate, p.publicationDate], function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(this.lastID);
            }
        });
    });
}

//UPDATE TITLE
async function updateTitle(brand) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE brandname SET brand = ? WHERE brandId = 1';
        db.run(sql, [brand], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
       });
    });

};
//GET TITLE
function getTitle() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT brand FROM brandname WHERE brandId = 1";
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err)
            else {
                const brand = rows.map((b) => b.brand)[0];
                resolve(brand);
                console.log(brand) ;
            };
        });
    });
}
exports.getAll = getAll ; 
exports.getAllPub = getAllPub ; 
exports.getBlocksOnPageID = getBlocksOnPageID ; 
exports.createPage = createPage ; 
exports.createBlock = createBlock ; 
exports.getBlocksOnPublishedPageID = getBlocksOnPublishedPageID ; 
exports.updatePositions = updatePositions ;
exports.deletePage = deletePage ;
exports.updateBlocks = updateBlocks ;
exports.addBlocks = addBlocks ;
exports.deleteBlock = deleteBlock ;
exports.getAllUsers = getAllUsers ;
exports.updatePage = updatePage ;
exports.getTitle = getTitle ;
exports.updateTitle = updateTitle ;
exports.getUser = getUser ;





