// tscode

// getting gameboard
const gameBoard: HTMLDivElement = document.querySelector(".gameBoard")!;

// getting setup area
const gameSetUp: HTMLDivElement = document.querySelector("div.gameSetUp")!;

// getting row input
const rowInput: HTMLInputElement = gameSetUp.querySelector("input#rows-input")!;

// getting columns input
const columnsInput: HTMLInputElement = gameSetUp.querySelector("input#columns-input")!;

// getting start button
const startBtn: HTMLDivElement = gameSetUp.querySelector("button#startButton")!;

// getting gamemode h2
const gameMode: HTMLHeadingElement = document.querySelector("h2.gameMode")!;

// console.log(gameMode);

const congrats: HTMLHeadingElement = document.querySelector("h2.congrats")!;

// console.log(congrats);

const spanNumOfCards: HTMLSpanElement = document.querySelector("span#numOfCards")!;

const noMatchWarn : HTMLParagraphElement = document.querySelector("p#no-match-warning")!;

// i think it's all good but if not I'll put more

// now for the JS-side game vars

const cardFront: string = "Match!";

class Card {
    content: string;
    id: number;
    constructor(cont: string, idnum: number) {
        
        this.content = cont;
        this.id = idnum;

    }
}

// for deck
let arrOfCards: Array<Card> = [];

// counting the deck
let numOfCards: number = 0;

// number of cards (not pairs!) matched: should equal numOfCards at the end of the game
let numMatched: number = 0;

// amt of fails
let fails: number = 0;

// maximum amt of fails
let maxFails: number = 3;

// amt of cards per "pair" or how many cards per match
let matches: number = 2;

// number of unmatched cards that are currently flipped
let numFlipped: number = 0;

// if game is currently active or not
let gameActive: boolean = false;

// if cards are flipped and timed out for checking
let cardTimeOut: boolean = false;

// array of cards (HTML div nodes) with .matched
let matchedCards: NodeListOf<HTMLDivElement>;

// array of html cards ughh
let arrOfHTMLCards: Array<HTMLDivElement>;

// now for functions

// i was going to have two params: rows : number, columns:number, but decided nah
function createDeck(numCards: number) {

    // for each card:
    for (let i = 0, j = 0; i < numCards; j++) {

        // i'm just gonna use a number ticking up as the card content for now
        const content: string = j.toString();

        // make a new card and push it to arrOfCards

        arrOfCards.push(new Card(content,i));

        // make another new card with same content, diff id, and push to arrOfCards

        i++;
        arrOfCards.push(new Card(content,i));

        i++;
    }
}

function createTable(rows: number, columns: number) {
    // creating temp copy array so we can keep track of which cards have or have not been added already
    let cardArr: Array<Card> = [...arrOfCards];

    // creating array of html cards
    let divCardArr: Array<HTMLDivElement> = [];

    // for each row:
    for (let i = 0; i < rows; i++) {
        // create a row
        const row: HTMLDivElement = document.createElement("div");

        // add row class
        row.classList.add("row");

        // append the row to the board
        gameBoard.appendChild(row);

        // for each column
        for (let j = 0; j < columns; j++) {
            // const element = array[j];

            // randomly select a card
            const cardSelArrNum: number = Math.floor(Math.random() * cardArr.length);

            // get card ID
            const selCardID: number = cardArr[cardSelArrNum].id;

            // create a card element
            const card: HTMLDivElement = document.createElement("div");

            // add card class
            card.classList.add("card");

            // add card id num
            card.id = selCardID.toString();

            // add card front text
            card.innerHTML = cardFront;

            // remove card from temp arr (so we don't select it again)
            cardArr.splice(cardSelArrNum, 1);

            // append card to row
            row.appendChild(card);

            divCardArr.push(card);
        }
        // rowArr.push(row);
    }
    // return rowArr;
    return divCardArr;
}

// function to clear table
function clearTable(){
    gameBoard.innerHTML="";
    arrOfCards=[];
    arrOfHTMLCards=[];
    congrats.innerHTML="";
    fails=0;
}

// function to flip cards
function flipCard(card : HTMLDivElement){
    // add flip class
    card.classList.add("flip");

    // change text of card to back content
    card.innerHTML=arrOfCards[parseInt(card.id)].content;

    // add num of flipped cards
    numFlipped++;
}

function flipBack(){
    // get list of flipped cards
    const flippedCards : NodeListOf<HTMLDivElement> = gameBoard.querySelectorAll("div.card.flip");

    // for each flipped card:
    for (let i = 0; i < flippedCards.length; i++) {
        const element = flippedCards[i];

        // set content back to front text and remove flip class
        element.innerHTML = cardFront;
        element.classList.remove("flip");
    }
    numFlipped=0;
}

function checkMatch(){
    // get list of flipped cards
    const flippedCards : NodeListOf<HTMLDivElement> = gameBoard.querySelectorAll("div.card.flip")!;

    // get string to match for: it doesnt matter which one we get it from, we're checking if all of them match anyways
    const matchFor : string = flippedCards[0].innerHTML;

    // for each card in the list after the first (since we grabbed the content of the first card, so of course the first one will match)...
    for (let i = 1; i < flippedCards.length; i++) {
        const element = flippedCards[i];
        // if the card doesn't match, break the loop and return false
        if (element.innerHTML !== matchFor) {return false;}
    }
    // this code should only run if everything matched, in that case return true
    return true;
}

// funct for checking if the game is done
function checkFinished(){
    
    // get all cards that are matched
    matchedCards = gameBoard.querySelectorAll("div.matched");

    // if all cards are matched, return true
    if (matchedCards.length>=numOfCards){return true;}

    // else, return false
    else {return false;}
}

// function for turning from flips to matches
function flipToMatched(){

    // get all flipped cards
    const flippedCards: NodeListOf<HTMLDivElement> = gameBoard.querySelectorAll("div.flip");

    // add .matched class and remove .flip to all
    for (let i = 0; i < flippedCards.length; i++) {
        const element = flippedCards[i];
        element.classList.add("matched");
        element.classList.remove("flip");
    }

    numFlipped=0;
    return checkFinished();
}

// event listeners:

// event listener for counting amt of cards
gameSetUp.addEventListener("input", ()=>{
    // every input, these will be removed and updated
    spanNumOfCards.classList.remove("bold-red-text");
    spanNumOfCards.innerHTML="";
    noMatchWarn.innerHTML="";

    // if the game is already active, break
    if (gameActive){return 0;}

    // if any of the inputs are blank or not numbers, warning then break
    else if(isNaN(parseInt(rowInput.value)*parseInt(columnsInput.value))){

        noMatchWarn.innerHTML="Please input numbers.";

        return 0;
    }

    // if the game is not active and the inputs are filled with numbers:

    // calculate numOfCards
    numOfCards=parseInt(rowInput.value) * parseInt(columnsInput.value);

    // set the html text on screen to numofcards
    spanNumOfCards.innerHTML=numOfCards.toString();

    // if numOfCards is not divisible by matches (default: 2): put up warnings
    if (numOfCards%matches!==0||numOfCards<=0){
        spanNumOfCards.classList.add("bold-red-text");
        noMatchWarn.innerHTML=`Number of cards needs to be above 0 and divisible by ${matches}!`
    }
})

// function for congrats text
function congratsText(){
    congrats.innerHTML = "Good job! You matched them all!";
    gameActive=false;
}

// event listener for clicking startbtn
startBtn.addEventListener("click",()=>{
    // calculate numOfCards
    numOfCards=parseInt(rowInput.value) * parseInt(columnsInput.value);

    // if numOfCards is NaN, <=0, or not divisible by matches (default 2): break
    if((isNaN(numOfCards)||(numOfCards<=0)||(numOfCards%matches!==0))){return 0;}

    // this code should only run if numOfCards is usable
    clearTable();
    createDeck(numOfCards);
    arrOfHTMLCards = createTable(parseInt(rowInput.value),parseInt(columnsInput.value));

    // now let's make event listeners for the new cards
    for (let i = 0; i < arrOfHTMLCards.length; i++) {

        // element = this card
        const element = arrOfHTMLCards[i];

        // adding event listeners to the cards
        element.addEventListener("click",function(){

            // if cards are being timed out for checking, break
            if(cardTimeOut){return 0;}

            // if the element is already matched, break
            if(element.classList.contains("matched")){return 0;}

            // the following code should only run if the card wasn't already matched

            // flip this card
            flipCard(this);

            // if number of flipped cards >= matches
            if (numFlipped>=matches){

                // add a mark to not allow matches before the timeout funct executes!

                cardTimeOut = true;

                // set a timeout so the user can see what cards they matched
                setTimeout(()=>{
                // check if the cards match
                const isMatch : boolean = checkMatch();

                // if they do: 
                if (isMatch) {

                    // turn the cards into matched cards and check if the game is done:
                    let isDone: boolean = flipToMatched();

                    // if it is:
                    if (isDone) {
                        congratsText();
                    }
                }

                // flip back all unmatched cards
                flipBack();

                // let the system know timeout is done for checking
                cardTimeOut = false;
            },500)}

        })
    }
    gameActive=true;

})
