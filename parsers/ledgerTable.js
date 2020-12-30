module.exports.parse = parseLedger

function parseLedger(pokerGame){
  const cashouts = pokerGame.adminActions.filter(i => i.action == 'playerQuit')
  const buyins = pokerGame.adminActions.filter(i => i.action == 'createGame' || i.action == 'adminApproved')
  let ledgerTable = []
  pokerGame.players.forEach(function(player){
    let playerCashouts = cashouts.filter(i => i.player == player)
    let playerCashoutsAmount = playerCashouts.reduce((acc,cur) => acc + cur.amount, 0)
    let playerBuyins = buyins.filter(i => i.player == player)
    let playerBuyinsAmount = playerBuyins.reduce((acc,cur) => acc + cur.amount, 0)
    let playerWins = pokerGame.hands.filter(i => i.player == player && i.action == 'collected')
    let potsWon = playerWins.length
    let averagePotWin = "N/A"
    if (potsWon > 0) {
      averagePotWin = (playerWins.reduce((a,c) => a + c.amount, 0)/potsWon).toFixed(2)
    }
    else {
      averagePotWin = "N/A"
    }
    ledgerTable.push({
      player: player,
      potsWon: potsWon,
      averagePotWin: averagePotWin,
      buyins: playerBuyinsAmount,
      cashouts: playerCashoutsAmount,
      net: playerCashoutsAmount - playerBuyinsAmount
    })
  })
  // Sort by net, descending
  ledgerTable.sort(function(a,b){
    return b.net - a.net
  })
  // Set values to integers or cents
  if (pokerGame.useCents){
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