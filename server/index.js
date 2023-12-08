'use strict';

const PORT = 3000;

const express = require('express');

//Middleware
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');

// passport
const passport = require('passport');
const LocalStrategy = require('passport-local');

const app = express();
app.use(morgan('combined'));
app.use(express.json());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials:true,
    }
));

const dao = require('./dao.js')
const {User, Page, Block, ImagePath} = require('./model.js') ; 

app.use(session({
    secret: 'Pleasebekind', 
    resave: false, 
    saveUninitialized: false, 
}));

passport.use(new LocalStrategy((username, password, callback) => {
    // verify function
    dao.getUser(username, password).then((user) => {
        callback(null, user);
    }).catch((err) => {
        callback(null, false, err);
    });
}));

passport.serializeUser((user, callback) => {
    callback(null, { userId: user.userId, type: user.type, username: user.username, name: user.name, surname: user.surname});
});
passport.deserializeUser((serializedUser, callback) => {
    callback(null, serializedUser);
});

app.use(passport.authenticate('session'));

// Custom middleware: check login status
const isLogged = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(500).send("NOT AUTHENTICATED");
    }
}

// POST /api/login
app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
    req.logout(()=>{res.end()});
});

// unauth users 

app.get('/api/PublishedPages', async( req, res) => {
    try {
      const pages = await dao.getAllPub() ; 
      res.json(pages) ; 
    } catch (err) {
        res.status(500).send(err.message)
    }
}) ; 

app.get('/api/PublishedPages/:pageId/blocks', async( req, res) => {
    const pageId = req.params.pageId ; 
    
    try {
      const blocks  = await dao.getBlocksOnPublishedPageID(pageId) ; 
      res.json(blocks) ; 
    } catch (err) {
        res.status(500).send(err.message)
    }
}) ;

app.get('/api/getAllUsers', (req,res) => {
    dao.getAllUsers().then((result) => {
        res.json(result);
    }).catch((error) => {
        res.status(500).send(error.message);
    })
});

app.get('/api/brand/get', (req, res) => {
    dao.getTitle().then((result) => {
        res.json(result);
    }).catch((error) => {
        res.status(500).send(error.message);
    });
});

app.get('/api/pages', async (req,res) => {
    try {
        const pages = await dao.getAll() ; 
        res.json(pages) ; 
      } catch (err) {
          res.status(500).send(err.message)
      }
}) ;

app.use(isLogged) ; 
// from now on only auth 

app.get('/api/pages/:pageId/blocks', async( req, res) => {
    const pageId = req.params.pageId ; 
    
    try {
      const blocks  = await dao.getBlocksOnPageID(pageId) ; 
      res.json(blocks) ; 
    } catch (err) {
        res.status(500).send(err.message)
    }
}) ;

//update blocks
app.post('/api/blocks/update', async (req, res) => {
    const {list} = req.body;
    const castedList = [];
    for(const elem of list){
        castedList.push(new Block(elem.blockId,elem.content,elem.position,elem.pageId,elem.type,elem.pathId));
    }
    try {
        let stat = await dao.updateBlocks(castedList);
        res.send(stat);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// add blocks
app.post('/api/blocks/add', async (req, res) => {
    const {list} = req.body;
    const castedList = [];
    for(const elem of list){
        castedList.push(new Block(elem.blockId,elem.content,elem.position,elem.pageId,elem.type,elem.pathId));
    }
    try {
        let stat = await dao.addBlocks(castedList);
        res.send(stat);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// delete blocks
app.post('/api/blocks/delete', async (req, res) => {
    const {list} = req.body;
    const castedList = [];
    for(const elem of list){
        castedList.push(new Block(elem.blockId,elem.content,elem.position,elem.pageId,elem.type,elem.pathId));
    }
    try {
        let stat = await dao.deleteBlock(castedList);
        res.send(stat);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// check 
app.post('/api/page/delete', async (req, res) => {
    const pageId = req.body.pageId;
    console.log("index"+pageId)
    try {
        let stat = await dao.deletePage(pageId);
        res.send(stat);
    } catch (error) {
        res.status(500).send(error.message);
    }
});



app.post('/api/page/add', async (req, res) => {
    const bodyanswer = req.body;
    const page = new Page(undefined, bodyanswer.title, bodyanswer.author, bodyanswer.userId, bodyanswer.creationDate, bodyanswer.publicationDate);
    try {
        let stat = await dao.createPage(page);
        res.send(String(stat));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/page/:pageId/update', async (req, res) => {
    const pageId = req.params.pageId;
    const bodyanswer = req.body;
    const title = bodyanswer.title;
    const author = bodyanswer.author;
    const publicationDate = bodyanswer.publicationDate;
    try {
        let stat = await dao.updatePage(pageId, title, author, publicationDate);
        res.send(stat);
    } catch (error) {
        res.status(500).send(error.message);
    }
});



app.post('/api/brand/update', async (req, res) => {
    const bodyanswer = req.body;
    const brand = bodyanswer.brand;
    try {
        let stat = await dao.updateTitle(brand);
        res.send(stat);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT,
    () => { console.log(`Server started on http://localhost:${PORT}/`) });