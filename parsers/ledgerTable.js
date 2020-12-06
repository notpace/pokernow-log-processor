
module.exports.getParsedLedgerTable = getParsedLedgerTable

function getParsedLedgerTable(data){
  return constructLedgerTable(getLedgerActions(data));
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