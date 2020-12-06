/*
This code makes a bunch of assumptions that (if violated) will definitely break things:
* All log files are complete (beginning to end of game, no mid-hand exports)
* Bet values are integers, not currency
* Player names (not IDs) are used to identify people and must stay consistent for the game
* The game played is Texas Hold'em (may also work for short-deck hold'em)
*/

const express = require("express")
const exphbs  = require('express-handlebars');
const multer = require('multer')
const fs = require('fs'); 
const parse = require('csv-parse');
const colors = ['green','blue','red','orange','purple','brown','black', 'pink', 'gray']

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
      res.render('charts', {
        stackSizes: JSON.stringify(parseFile(data)[0]),
        handOutcomes: JSON.stringify(parseFile(data)[1]),
        winningHands: JSON.stringify(parseFile(data)[2]),
        ledgerTable: parseFile(data)[3]
      })
      fs.unlink(req.file.path, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('Logfile processed and deleted');
      }); 
  })
})

let port = process.env.port|3000
app.listen(port)
console.log("App started at http://localhost:" + port)

function parseFile(data){
  let ledgerTable = constructLedgerTable(getLedgerActions(data));
  let sortedData = sortByOrder(orderToInt(data));
  let stackSizes = getStackSizeChartData(pivotStacks(flattenStackData(getStacks(sortedData))))
  let handOutcomes = getHandOutcomesChartData(getHandOutcomes(getHands(sortedData)))
  let winningHands = getWinningHandsChartData(getWinningHands(getHands(sortedData)))
  return [stackSizes,handOutcomes,winningHands,ledgerTable]
}

//Parsing Cleanup
function orderToInt(data){
  return fixedOrder = data.map(function(obj) {
    return {order: parseInt(obj.order), at: obj.at, entry: obj.entry};
  });
}

function sortByOrder(data){
  return data.sort(function(a,b){
    return a.order - b.order;
  })
}

// Get total number of hands
function getTotalHands(logFile){
  const endHandRegex = /-- ending hand #(\d*) --/
  let endingHands = logFile.filter(row => row.entry.search(endHandRegex) >= 0)
  return endingHands.length
}

// Get stack info
function getStacks(data){
  let allStacks = data.filter(item => item.entry.search("Player stacks") >= 0 );
  return parsedStacks = allStacks.map(function(obj) {
    return { order: obj.order, at: obj.at, entry: parseStacks(obj.entry) };
  });
}

function parseStacks(stacks){
  let splitStacks = stacks.replace("Player stacks: ","").split(" | ")
  let parsedStacks = []
  const playerRegex = /\"(.*)\s@/
  const stackRegex = /\(([^)]+)\)/
  splitStacks.forEach(function(stack){
    let player = stack.match(playerRegex)[1].trim();
    let stackTotal = parseInt(stack.match(stackRegex)[1]);
    parsedStacks.push({"player": player, "stack": stackTotal})
  })
  return parsedStacks;
}

function flattenStackData(stacks){
  let header = ['hand','player','stack']
  let flattenedStacks = [header]
  let hand = 1
  stacks.forEach(function(stack){
    stack.entry.forEach(function(playerStack){
      let player = playerStack.player
      let stackTotal = playerStack.stack
      flattenedStacks.push([hand,player,stackTotal])
    })
    hand += 1
  })
  return flattenedStacks
}

function pivotStacks(flattenedStacks){
  // Get just the data (no header row)
  let data = flattenedStacks.slice(1,)
  // Get all the players
  let players = []
  data.forEach(function(row){
    if (players.indexOf(row[1]) < 0 ){
      players.push(row[1])
    }
  })
  // Get all the hands
  totalHands = 0
  data.forEach(function(row){
    if (row[0] > totalHands ){
      totalHands = row[0]
    }
  })
  // Iterate through hands and grab the stack size for each player
  allHands = [['hand'].concat(players)]
  hand = 1
  while (hand <= totalHands){
    handData = Array.apply(null, Array(players.length + 1)).map(function () {})
    handData[0] = hand
    players.forEach(function(player, index){
      data.forEach(function(row){
        if (row[0] == hand && row[1] == player) {
          handData[index + 1] = row[2]
        }
      })
    })
    allHands.push(handData)
    hand += 1
  }
  return(allHands)
}

function getStackSizeChartData(pivotData){
  // Get player Names
  players = pivotData[0]
  players.shift()
  // Get the total number of hands and make the x-axis label
  totalHands = pivotData.length - 1
  xlabel = Array.from(Array(totalHands),(x,i)=>i)
  // Iterate through each player and grab their stack size from each hand
  allPlayerData = []
  players.forEach(function(player,index){
    playerName = player
    playerData = []
    pivotData.slice(1,).forEach(function(row){
      playerData.push(row[index+1])
    })
    allPlayerData.push({
      label: playerName,
      data: playerData,
      borderColor: colors[index],
      backgroundColor: colors[index],
      lineTension: 0,
      pointRadius: 0,
      fill: false,
      borderWidth: 2
    })
  })
  return {
    type: 'line',
    data: {
      labels: xlabel,
      datasets: allPlayerData
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        labels: {
          boxWidth: 16,
          fontSize: 16,
          fontFamily: "Roboto, sans-serif",
          padding: 16
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            precision:0,
            beginAtZero: true,
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: false,
            labelString: 'HAND NUMBER',
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          },
          ticks: {
            maxTicksLimit: 12,
            fontSize: 18
          }
        }]
      }
    }
  }
}

// Filter admin actions
function handsOnly(logFile){
  const adminRegex = /(The admin|The player|Your hand).*/
  return logFile.filter(row => row.entry.search(adminRegex) < 0)
}

// Separate all the hands
function getHands(logFile){
  // Create an empty array of hand objects
  let totalHands = getTotalHands(logFile)
  handsData = Array.apply(null, Array(totalHands))
  let i = 0
  for (i = 0; i < totalHands; i++) {
    handsData[i] = {hand: i+1, entries: []}
  }
  // Iterate through hands to populate the empty array
  const handBeginRegex = /-- starting hand #(\d*).*/
  let hand = 0
  handsOnly(logFile).forEach(function(row){
    if (row.entry.search(handBeginRegex) >= 0) {
      hand += 1
    }
    handsData.forEach(function(obj){
      if (obj.hand === hand) {
        obj.entries.push({
          order: row.order,
          at: row.at,
          entry: row.entry
        })
      }
    })
  })
  return handsData
}

// Set up for hand outcome searches
const showdownRegex = /.*collected (\d*) from pot with ([\w\s]*)[,(].*/
const showdown = (row) => row.entry.search(showdownRegex) >= 0
const riverRegex = /river: .*/
const river = (row) => row.entry.search(riverRegex) >= 0
const turnRegex = /turn: .*/
const turn = (row) => row.entry.search(turnRegex) >= 0
const flopRegex = /flop: .*/
const flop = (row) => row.entry.search(flopRegex) >= 0

// Determine where action ended on each hand
function getHandOutcomes(allHands){
  let handOutcomes = []
  let handNum = 1
  allHands.forEach(function(hand){
    let outcome = ''
    if (hand.entries.some(showdown)){outcome='Showdown'}
    else if (hand.entries.some(river)){outcome='River'}
    else if (hand.entries.some(turn)){outcome='Turn'}
    else if (hand.entries.some(flop)){outcome='Flop'}
    else {outcome='Preflop'}
    handOutcomes.push({hand: handNum, outcome: outcome})
    handNum += 1
  })
  return handOutcomes
}

function getHandOutcomesChartData(handOutcomes){
  totalHands = handOutcomes.length
  let outcomeLabels = ['Preflop','Flop','Turn','River','Showdown']
  outcomeSums = new Array(outcomeLabels.length).fill(0)
  outcomeSums.forEach(function(outcome,index){
    handOutcomes.forEach(function(hand){
      if (hand.outcome == outcomeLabels[index]) {
        outcomeSums[index] += 1
      }
    })
  })
  return {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: outcomeSums,
        backgroundColor: [
          '#dceeff', '#c6deff', '#a7ccff', '#85a8e3', '#6c9bd0'
        ]
      }],
      labels: outcomeLabels
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          type: 'linear',
          ticks: {
            precision:0,
            beginAtZero: true,
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }],
        yAxes: [{
          ticks: {
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }]
      }
    }
  }
}

// Determine which hands won at showdown
function getWinningHands(allHands){
  let winningHands = []
  allHands.forEach(function(hand){
    if (hand.entries.some(showdown)){
      let winningHand = ''
      hand.entries.forEach(function(row){
        if (row.entry.match(showdownRegex)){
          winningHand = row.entry.match(showdownRegex)[2]
        }
      })
      winningHands.push(winningHand)
    }
  })
  let fixedHighCards = winningHands.map(mapHighCard)
  return fixedHighCards
}

function mapHighCard(hand){
  const highCardRegex = /[\w\s]High/
  if (hand.search(highCardRegex) >= 0){
    return 'High Card'
  }
  else {return hand}
}

function getWinningHandsChartData(winningHands){
  let winningHandLabels = ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush','Royal Flush']
  let winningHandCounts = []
  winningHandLabels.forEach(function(hand){
    let count = 0
    winningHands.forEach(function(winner){
      if (hand == winner){
        count += 1
      }
    })
    winningHandCounts.push(count)
  })
  return {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: winningHandCounts,
        backgroundColor: [
          'EEE','#CCC','#AAA','#888','#666','#444','333','#222','111','#000'
        ]
      }],
      labels: winningHandLabels
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          type: 'linear',
          ticks: {
            precision:0,
            beginAtZero: true,
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }],
        yAxes: [{
          ticks: {
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }]
      }
    }
  }
}

// Get Ledger Actions
function getLedgerActions(logFile){
  const quitRegex = /The player "([\w\s]*) @ [\d\w]*" quits the game with a stack of (\d*)/
  const createRegex = /The player "([\w\s]*) @ [\d\w]*" created the game with a stack of (\d*)/
  const adminRegex = /The admin approved the player "([\w\s]*) @ [\d\w]*" participation with a stack of (\d*)/
  let ledgerActions = []
  logFile.forEach(function(row){
    if (row.entry.search(quitRegex) >= 0) {
      ledgerActions.push({
        player: row.entry.match(quitRegex)[1],
        cash: true, // Positive cashflow
        amount: parseInt(row.entry.match(quitRegex)[2])
      })
    }
    else if (row.entry.search(createRegex) >= 0) {
      ledgerActions.push({
        player: row.entry.match(createRegex)[1],
        cash: false, // Negative cashflow
        amount: parseInt(row.entry.match(createRegex)[2])
      })
    }
    else if (row.entry.search(adminRegex) >= 0) {
      ledgerActions.push({
        player: row.entry.match(adminRegex)[1],
        cash: false, // Negative cashflow
        amount: parseInt(row.entry.match(adminRegex)[2])
      })
    }
  })
  return ledgerActions
}

function constructLedgerTable(ledgerActions){
  // Get list of players
  let players = []
  ledgerActions.forEach(function(action){
    if (players.indexOf(action.player) < 0){
      players.push(action.player)
    }
  })
  // Initialize ledger object with player, buy-ins, cash-outs, net
  let ledgerTable = []
  players.forEach(function(player){
    ledgerTable.push({
      player: player,
      buyins: 0,
      cashouts: 0,
      net: 0
    })
  })
  // Calculate Buy-ins and Cash-outs
  ledgerTable.forEach(function(row){
    let player = row.player
    ledgerActions.forEach(function(action){
      if (action.player == player) {
        if (action.cash) {
          row.cashouts += action.amount
        }
        else if (!action.cash) {
          row.buyins += action.amount
        }
      }
    })
  })
  // Calculate nets
  ledgerTable.forEach(function(row){
    row.net = row.cashouts - row.buyins
  })
  // Turn the Ledger Table into an Object for Handlebars
  return Object.assign({}, ledgerTable)
}