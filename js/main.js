'use strict'

const FLAG = '🟥'
const MINE_IMG = '💣'
var gBoard
var gLevel = getLevel()
var gTimerInterval

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    livesCount: 3,
    isManual: false,
    mineCount: gLevel.SIZE
}
var gScore
var gTimer = document.querySelector('.timer')
var gNotMines = []


function onManually() {
    onInitGame()
    gGame.isManual = true
}

function createEasyBoard() {
    gLevel = getLevel(4, 2)
    gBoard = createBoard()
    renderBoard(gBoard, '.board')
    onInitGame()
}


function createMediumBoard() {
    gLevel = getLevel(8, 14)
    gBoard = createBoard()
    renderBoard(gBoard, '.board')
    onInitGame()
}


function createHardBoard() {
    gLevel = getLevel(12, 32)
    gBoard = createBoard()
    renderBoard(gBoard, '.board')
    onInitGame()
}



function getLevel(SIZE = 4, MINES = 2) {
    var level = {
        SIZE: SIZE,

        MINES: MINES
    };
    return level
}



function onInitGame() {
    gGame.isOn = false
    clearInterval(gTimerInterval)
    gGame.secsPassed = 0
    gTimer.innerText = `Time passed:  \n 0`
    gGame.markedCount = 0
    gGame.shownCount = 0
    gGame.livesCount = 3
    gBoard = createBoard()
    renderBoard(gBoard, '.board')
    document.querySelector('.emoji').style.display = 'block'
    document.querySelector('.winBtn').style.display = 'none'
    document.querySelector('.loseBtn').style.display = 'none'

    gScore = document.querySelector('h1')
    gScore.innerText = `cells shown: ${gGame.shownCount}
     cells marked: ${gGame.markedCount}
     lives remaining: ${gGame.livesCount}`

}


function createBoard() {
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])

        for (var j = 0; j < gLevel.SIZE; j++) {

            board[i][j] = { gameElement: ' ', i: i, j: j, minesAroundCount: 0, isShown: false, isMarked: false, isMine: false }
        }
    }
    if (gGame.isOn === true) {

        for (var i = 0; i < gLevel.MINES; i++) {
            var mine = getMines()

            board[mine.i][mine.j] = mine
            var negs1 = countNegs(mine.i, mine.j, board)
            for (var x = 0; x < negs1.length; x++) {
                negs1[x].minesAroundCount++
                negs1[x].gameElement = negs1[x].minesAroundCount
            }

        }
    }
    return board
}


function getMines() {
    var mine = {
        gameElement: MINE_IMG, i: getRandomInt(0, gLevel.SIZE - 1), j: getRandomInt(0, gLevel.SIZE - 1), isShown: false, isMarked: false, isMine: true

    }
    return mine
}

// countNegs(0, 0, gBoard)
// countNegs(2, 2, gBoard)
function countNegs(cellI, cellJ, mat) {
    var negs = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            if (mat[i][j]) { negs.push(mat[i][j]) }
        }
    }
    // console.log(negs);
    return negs
}


function renderBoard(mat, selector) {

    var strHTML = '<table border="1"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            var cellElement = mat[i][j].minesAroundCount
            var isMine = mat[i][j].isMine
            var cellIsShown = mat[i][j].isShown
            var cellMark = mat[i][j].isMarked
            if (isMine === true) {
                cellElement = MINE_IMG
            } if (mat[i][j].isMine === false && mat[i][j].minesAroundCount === 0) {
                cellElement = ' '
            }
            if (cellIsShown === false) {
                cellElement = ' '

                var className = `cell cell-${i}-${j}`
            } else {
                var className = `shown-cell cell-${i}-${j}`

            }
            if (cellMark === true) {
                cellElement = FLAG
            }



            strHTML += `<td class="${className}" onclick="getHint(${i}, ${j}), onCellClick(${cellIsShown}, ${i}, ${j}, ${isMine})" oncontextmenu="onCellMark(${cellMark}, ${i}, ${j})">${cellElement}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML

}
function onCellClick(isShown, i, j, cellIsMine) {
    if (window.event.ctrlKey) return
    if (gGame.isManual === true) {
        gBoard[i][j].isMine = true


    }
    // && gGame.mineCount < gLevel.MINES




    if (gGame.isOn === false) {
        gGame.isOn = true

        gNotMines.push(gBoard[i][j])
        gBoard = createBoard()
        renderBoard(gBoard, '.board')
    }

    // if (gGame.isOn === true) {


    if (gBoard[i][j].isShown === true) return
    if (gBoard[i][j].isMarked === true) return
    if (cellIsMine === true) {
        gGame.livesCount--
        if (gGame.livesCount === 0) {
            gameOVer()
            return
        }
    }
    if (gBoard[i][j].isShown === false) {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        if (gBoard[i][j].minesAroundCount === 0) {

            expandShown(gBoard, i, j)
        }

    }

    renderBoard(gBoard, '.board')
    isWin()
    // }
}
function expandShown(board, i, j) {

    var shownNegs = countNegs(i, j, board)
    for (var x = 0; x < shownNegs.length; x++) {
        if (!shownNegs[x].isMine && !shownNegs[x].isShown) {
            shownNegs[x].isShown = true
            gGame.shownCount++
            if (shownNegs[x].minesAroundCount) continue
            expandShown(gBoard, shownNegs[x].i, shownNegs[x].j)
        }
    }
}

function onCellMark(isMarked, i, j) {
    if (gGame.isOn === false) return
    if (gBoard[i][j].isShown === true) return
    if (isMarked === true) {
        return

    }
    if (isMarked === false) {

        gBoard[i][j].isMarked = true
        gGame.markedCount++
        if (gGame.markedCount > gLevel.MINES) {
            gameOVer()
        }
    }
    renderBoard(gBoard, '.board')
    isWin()
}

function gameOVer() {
    gGame.isOn = false
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard, '.board')
    document.querySelector('.emoji').style.display = 'none'
    var loseBtn = document.querySelector('.loseBtn')
    loseBtn.style.display = 'block'
    clearInterval(gTimerInterval)

}
function isWin() {
    var boardCount = 0
    var winBtn = document.querySelector('.winBtn')
    gScore.innerText = `cells shown: ${gGame.shownCount}
     cells marked: ${gGame.markedCount}
    lives remaining: ${gGame.livesCount}`
    if (gGame.secsPassed === 0) {

        timer()
    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            boardCount++
        }
    }
    if (gGame.markedCount + gGame.shownCount === boardCount) {
        document.querySelector('.emoji').style.display = 'none'
        winBtn.style.display = 'block'
        gGame.isOn = false
        clearInterval(gTimerInterval)

    }
}
function timer() {
    if (gGame.isOn === true) {

        var start = Date.now()

        gTimerInterval = setInterval(function () {
            var currTs = Date.now()
            var secs = parseInt((currTs - start) / 1000)
            var ms = (currTs - start) - secs * 1000
            ms = '000' + ms
            ms = ms.substring(ms.length - 2, ms.length)
            gGame.secsPassed = secs + ' : ' + ms
            gTimer.innerText = `Time passed: \n ${gGame.secsPassed}`
        }, 100)
        return
    }
    gTimer.innerText = 0
}
function getHint(i, j) {

    if (!gGame.isOn) return
    if (window.event.ctrlKey) {
        reveal(i, j)
        return
    }


    renderBoard(gBoard, '.board')
}


function reveal(i, j) {

    gBoard[i][j].isShown = true
    var revealNegs = countNegs(i, j, gBoard)
    for (var x = 0; x < revealNegs.length; x++) {
        revealNegs[x].isShown = true
    }
    renderBoard(gBoard, '.board')
    {
        setTimeout(unReveal, 1000)
    }

}

