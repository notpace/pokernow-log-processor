module.exports.parsePokerGame = parsePokerGame

//Parsing Cleanup
function orderToInt(data){
  return fixedOrder = data.map(function(obj) {
    return {order: parseFloat(obj.order), at: obj.at, entry: obj.entry};
  });
}

function sortByOrder(data){
  return data.sort(function(a,b){
    return a.order - b.order;
  })
}

// Admin action regexes
const createGameRegex = /^The player "(.*) @ (.*)" created the game with a stack of (\d*(?:\.\d\d)?)/
const adminApprovedRegex = /^The admin approved the player "(.*) @ (.*)" participation with a stack of (\d*(?:\.\d\d)?)/
const seatRequestRegex = /^The player "(.*) @ (.*)" requested a seat./
const playerJoinRegex = /^The player "(.*) @ (.*)" joined the game with a stack of (\d*(?:\.\d\d)?)/
const playerQuitRegex = /^The player "(.*) @ (.*)" quits the game with a stack of (\d*(?:\.\d\d)?)/
const sitStandRegex = /^The player "(.*) @ (.*)" (\w*)\s\w* with the stack of (\d*(?:\.\d\d)?)/

// Hand regexes
const beginHandRegex = /^-- starting hand #(\d*).*/
const yourHandRegex = /^Your hand is (.*)/
const blindRegex = /^"(.*) @ (.*)" posts a (?:\bmissed\b\s|\bmissing\b\s)?(\bbig\b|\bsmall\b) blind of (\d*(?:\.\d\d)?)/
const straddleRegex = /^"(.*) @ (.*)" posts a straddle of (\d*(?:\.\d\d)?)/
const actionRegex = /^"(.*) @ (.*)" (\bchecks\b|\bbets\b|\bcalls\b|\braises\b|\bfolds\b)(?: (\d*(?:\.\d\d)?))*/
const showRegex = /^"(.*) @ (.*)" shows a (.*)\./
const uncalledBetRegex = /^Uncalled bet of (\d*(?:\.\d\d)?) returned to "(.*) @ (.*)"/
const collectedRegex = /^"(.*) @ (.*)" collected (\d*(?:\.\d\d)?) from pot(?: with (\w\s\bHigh\b|.*,?.*) \(combination\: (.*)\))?/
const cardsRegex = /^(\b[fF]lop\b|\b[tT]urn\b|\b[rR]iver\b)[\s\(second run\)]*: (.*)/
const rabbitHuntRegex = /^Undealt cards: (.*)/
const endHandRegex = /^-- ending hand #(\d*) --/

// Stack regex
const stacksRegex = /^Player stacks: (.*)/
const playerStackRegex = /"(.*) @ (.*)" \((\d*(?:\.\d\d)?)\)/

// String of cards to an array of cards
function cardArray(cardString){
  if (cardString){
    return cardString.replace(/[\,\[\]]/g,'').trim().split(' ')
  }
  else return null
}

// Create the fully parsed pokerGame object
function parsePokerGame(data){
  let players = []
  let hands = []
  let stacks = []
  let adminActions = []
  let unparsedLogEntries = []
  let handNumber = 0
  let useCents = false
  let sortedData = sortByOrder(orderToInt(data));
  sortedData.forEach(function(row){
    // Admin actions
    if (createGameRegex.test(row.entry)){
      adminActions.push({
        action: 'createGame',
        player: row.entry.match(createGameRegex)[1],
        playerId: row.entry.match(createGameRegex)[2],
        amount: parseFloat(row.entry.match(createGameRegex)[3]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (adminApprovedRegex.test(row.entry)){
      adminActions.push({
        action: 'adminApproved',
        player: row.entry.match(adminApprovedRegex)[1],
        playerId: row.entry.match(adminApprovedRegex)[2],
        amount: parseFloat(row.entry.match(adminApprovedRegex)[3]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
      // Not ideal to keep setting this for each player, but it works
      if ((/(\d*\.\d\d)/).test(row.entry.match(adminApprovedRegex)[3])){
        useCents = true
      }
    }
    else if (seatRequestRegex.test(row.entry)){
      adminActions.push({
        action: 'seatRequest',
        player: row.entry.match(seatRequestRegex)[1],
        playerId: row.entry.match(seatRequestRegex)[2],
        amount: null,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (playerJoinRegex.test(row.entry)){
      adminActions.push({
        action: 'playerJoin',
        player: row.entry.match(playerJoinRegex)[1],
        playerId: row.entry.match(playerJoinRegex)[2],
        amount: parseFloat(row.entry.match(playerJoinRegex)[3]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (playerQuitRegex.test(row.entry)){
      adminActions.push({
        action: 'playerQuit',
        player: row.entry.match(playerQuitRegex)[1],
        playerId: row.entry.match(playerQuitRegex)[2],
        amount: parseFloat(row.entry.match(playerQuitRegex)[3]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (sitStandRegex.test(row.entry)){
      adminActions.push({
        action: row.entry.match(sitStandRegex)[3],
        player: row.entry.match(sitStandRegex)[1],
        playerId: row.entry.match(sitStandRegex)[2],
        amount: parseFloat(row.entry.match(sitStandRegex)[4]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    // Hands
    else if (beginHandRegex.test(row.entry)){
      handNumber += 1
      hands.push({
        handNumber: handNumber,
        player: null,
        playerId: null,
        action: 'beginHand',
        cards: null,
        amount: null,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (yourHandRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: null,
        playerId: null,
        action: 'yourHand',
        cards: cardArray(row.entry.match(yourHandRegex)[1]),
        amount: null,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (straddleRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: row.entry.match(straddleRegex)[1],
        playerId: row.entry.match(straddleRegex)[2],
        action: 'straddle',
        cards: null,
        amount: parseFloat(row.entry.match(straddleRegex)[3]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (blindRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: row.entry.match(blindRegex)[1],
        playerId: row.entry.match(blindRegex)[2],
        action: row.entry.match(blindRegex)[3] + 'Blind',
        cards: null,
        amount: parseFloat(row.entry.match(blindRegex)[4]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (actionRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: row.entry.match(actionRegex)[1],
        playerId: row.entry.match(actionRegex)[2],
        action: row.entry.match(actionRegex)[3],
        cards: null,
        amount: parseFloat(row.entry.match(actionRegex)[4]) || null,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (collectedRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: row.entry.match(collectedRegex)[1],
        playerId: row.entry.match(collectedRegex)[2],
        action: 'collected',
        cards: cardArray(row.entry.match(collectedRegex)[5]) || null,
        amount: parseFloat(row.entry.match(collectedRegex)[3]),
        winningHand: row.entry.match(collectedRegex)[4] || null,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (uncalledBetRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: row.entry.match(uncalledBetRegex)[2],
        playerId: row.entry.match(uncalledBetRegex)[3],
        action: 'uncalledBetReturned',
        cards: null,
        amount: parseFloat(row.entry.match(uncalledBetRegex)[1]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (showRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: row.entry.match(showRegex)[1],
        playerId: row.entry.match(showRegex)[2],
        action: 'show',
        cards: cardArray(row.entry.match(showRegex)[3]),
        amount: null,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (rabbitHuntRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: null,
        playerId: null,
        action: 'rabbitHunt',
        cards: cardArray(row.entry.match(rabbitHuntRegex)[1]),
        amount: null,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else if (endHandRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: null,
        playerId: null,
        action: 'endHand',
        cards: null,
        amount: null,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    // Cards dealt in the hands
    else if (cardsRegex.test(row.entry)){
      hands.push({
        handNumber: handNumber,
        player: null,
        playerId: null,
        action: row.entry.match(cardsRegex)[1].toLowerCase(),
        cards: cardArray(row.entry.match(cardsRegex)[2]),
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    // Stack sizes
    else if (stacksRegex.test(row.entry)){
      let stackSizes = []
      let splitStacks = row.entry.replace("Player stacks: ","").split(" | ")
      splitStacks.forEach(function(stack){
        stackSizes.push({
          player: stack.match(playerStackRegex)[1],
          playerId: stack.match(playerStackRegex)[2],
          stackSize: parseFloat(stack.match(playerStackRegex)[3])
        })
      })
      stacks.push({
        handNumber: handNumber,
        stackSizes: stackSizes,
        at: row.at,
        order: row.order,
        originalEntry: row.entry
      })
    }
    else unparsedLogEntries.push(row)
  })
  // Get list of players
  hands.forEach(function(row){
    if (row.player && !players.some(i => i == row.player)){
      players.push(row.player)
    }
  })
  return {
    players: players,
    numberOfHands: handNumber,
    useCents: useCents,
    hands: hands,
    stacks: stacks,
    adminActions: adminActions,
    unparsedLogEntries: unparsedLogEntries
  }
}