const quitRegex = /The player "([\w\s]*) @ [\d\w]*" quits the game with a stack of (\d*(?:\.\d\d)?)/
const createRegex = /The player "([\w\s]*) @ [\d\w]*" created the game with a stack of (\d*(?:\.\d\d)?)/
const adminRegex = /The admin approved the player "([\w\s]*) @ [\d\w]*" participation with a stack of (\d*(?:\.\d\d)?)/
const centsBuyinRegex = /participation with a stack of (\d*\.\d\d)/
const cents = (row) => row.entry.search(centsBuyinRegex) >= 0

module.exports.getParsedLedgerTable = getParsedLedgerTable

function getParsedLedgerTable(data){
  // Determine whether the logs are using cents values
  let usingCents = false
  if (data.some(cents)){usingCents = true}
  return constructLedgerTable(getLedgerActions(data),usingCents);
}

// Get Ledger Actions
function getLedgerActions(logFile){
  let ledgerActions = []
  logFile.forEach(function(row){
    if (row.entry.search(quitRegex) >= 0) {
      ledgerActions.push({
        player: row.entry.match(quitRegex)[1],
        cash: true, // Positive cashflow
        amount: parseFloat(row.entry.match(quitRegex)[2])
      })
    }
    else if (row.entry.search(createRegex) >= 0) {
      ledgerActions.push({
        player: row.entry.match(createRegex)[1],
        cash: false, // Negative cashflow
        amount: parseFloat(row.entry.match(createRegex)[2])
      })
    }
    else if (row.entry.search(adminRegex) >= 0) {
      ledgerActions.push({
        player: row.entry.match(adminRegex)[1],
        cash: false, // Negative cashflow
        amount: parseFloat(row.entry.match(adminRegex)[2])
      })
    }
  })
  return ledgerActions
}

function constructLedgerTable(ledgerActions,usingCents){
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
  // Sort by net, descending
  ledgerTable.sort(function(a,b){
    return b.net - a.net
  })
  // Set values to integers or cents
  if (usingCents){
    ledgerTable.map(function(row){
      row.buyins = row.buyins.toFixed(2)
      row.cashouts = row.cashouts.toFixed(2)
      row.net = row.net.toFixed(2)
    })
  }
  else {
    ledgerTable.map(function(row){
      row.buyins = parseInt(row.buyins)
      row.cashouts = parseInt(row.cashouts)
      row.net = parseInt(row.net)
    })
  }
  // Turn the Ledger Table into an Object for Handlebars
  return Object.assign({}, ledgerTable)
}