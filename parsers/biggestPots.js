module.exports.parse = parseBiggestPots

let sortByAmount = (a,b) => b.amount - a.amount
let handCollectionsFilter = hand => hand.action == 'collected'
let numberOfBigPots = 10
let amountsInCentsMap = hand => hand.amount = hand.amount.toFixed(2)

function parseBiggestPots(pokerGame){
  let biggestPots = pokerGame.hands.filter(handCollectionsFilter)
                                   .sort(sortByAmount)
                                   .slice(0, numberOfBigPots)
  biggestPots.forEach(function(hand){
    if (hand.cards){
      let cardsAsObjects = []
      hand.cards.forEach(function(card){
        let cardRegex = /(\w*)(\W)/
        let rank = card.match(cardRegex)[1]
        let suit = card.match(cardRegex)[2]
        switch(suit){
          case "♦":
            suit = "diamonds"
            break
          case "♥":
            suit = "hearts"
            break
          case "♣":
            suit = "clubs"
            break
          case "♠":
            suit = "spades"
            break
        }
        cardsAsObjects.push({
          card: card,
          rank: rank,
          suit: suit
        })
      })
      hand.cards = cardsAsObjects
    }
  })
  if (pokerGame.useCents){
    biggestPots.map(amountsInCentsMap)
  }
  return biggestPots
}