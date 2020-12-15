/*
This code makes a bunch of assumptions that (if violated) will definitely break things:
* All log files are complete (beginning to end of game, no mid-hand exports)
* Player names (not IDs) are used to identify people and must stay consistent for the game
* The game played is Texas Hold'em (may also work for short-deck hold'em)
*/

const express = require("express")
const exphbs  = require('express-handlebars');
const multer = require('multer')
const fs = require('fs'); 
const parse = require('csv-parse');
const pokerParse = require('./parsers/parse.js');
const stackSizes = require('./parsers/stackSizes.js');
const handOutcomes = require('./parsers/handOutcomes.js');
const winningHands = require('./parsers/winningHands.js');
const ledgerTable = require('./parsers/ledgerTable.js');
const biggestPots = require('./parsers/biggestPots.js');
const timeToAct = require('./parsers/timeToAct.js');

const upload = multer({ dest: 'uploads/' })

const app = express()
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

app.get('/',(req,res) => {
  res.render('home')
})

app.post('/upload', upload.single('logfile'), function (req, res, next) {
  const data = [];
  fs.createReadStream(req.file.path)
    .pipe(parse({columns: true}))
    .on('data', (r) => {
      data.push(r);        
    })
    .on('end', () => {
      let pokerGame = pokerParse.parsePokerGame(data)
      res.render('charts', {
        stackSizes: JSON.stringify(stackSizes.parse(pokerGame)),
        handOutcomes: JSON.stringify(handOutcomes.parse(pokerGame)),
        winningHands: JSON.stringify(winningHands.parse(pokerGame)),
        ledgerTable: ledgerTable.parse(pokerGame),
        biggestPots: biggestPots.parse(pokerGame),
        timeToAct: timeToAct.parse(pokerGame),
        pokerGame: JSON.stringify(pokerGame)
      })
      fs.unlink(req.file.path, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('Logfile processed and deleted');
      }); 
  })
})

let port = process.env.PORT || 3000
app.listen(port)
console.log("App started on port " + port)
