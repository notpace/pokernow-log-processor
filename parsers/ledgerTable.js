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
    ledgerTable.push({
      player: player,
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