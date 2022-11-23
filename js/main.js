'use strict'

const FLAG = '🟥'
const MINE_IMG = '💣'

var gBoard
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


var gLevel = getGLevel()

function getGLevel(SIZE = 4, MINES = 2) {
    var level = {
        SIZE: SIZE,
        MINES: MINES
    };
    return level
}

function onInitGame() {
    gGame.isOn = true
    gGame.markedCount = 0
    gGame.shownCount = 0
    var difficulties = document.querySelector('.difficulties')
    difficulties.innerHTML = `<button onclick="${4, 2}" class="easy">ez pz lemon squeezy</button>
        <button onclick="${8, 14}" class="medium">somewhere in between</button>
        <button onclick="${12, 32}" class="difficult">difficult difficult lemon difficult</button>`



    gBoard = createBoard()
    renderBoard(gBoard, '.board')
    document.querySelector('.emoji').style.display = 'block'
    document.querySelector('.winBtn').style.display = 'none'
    document.querySelector('.loseBtn').style.display = 'none'
    console.log(gLevel);
}


function createBoard() {
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])

        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = { gameElement: ' ', i: i, j: j, minesAroundCount: 0, isShown: false, isMarked: false, isMine: false }
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {

        var mine = getMines()

        board[mine.i][mine.j] = mine
        var negs1 = countNegs(mine.i, mine.j, board)
        for (var x = 0; x < negs1.length; x++) {
            negs1[x].minesAroundCount++
            negs1[x].gameElement = negs1[x].minesAroundCount
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
                cellElement = ''
            }
            if (cellIsShown === false) {
                cellElement = ''

                var className = `cell cell-${i}-${j}`
            } else {
                var className = `shown-cell cell-${i}-${j}`

            }
            if (cellMark === true) {
                cellElement = FLAG
            }



            strHTML += `<td class="${className}" onclick="onCellClick(${cellIsShown}, ${i}, ${j}, ${isMine})" oncontextmenu="onCellMark(${cellMark}, ${i}, ${j})">${cellElement}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML

}
function onCellClick(isShown, i, j, cellIsMine) {
    if (gGame.isOn === true)

        if (gBoard[i][j].isShown === true) return
    if (gBoard[i][j].isMarked === true) return
    if (cellIsMine === true) {

        gameOVer()
        return
    }
    if (gBoard[i][j].isShown === false) {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        expandShown(gBoard, i, j)

    }

    renderBoard(gBoard, '.board')
    isWin()
}
function expandShown(board, i, j) {

    var shownNegs = countNegs(i, j, board)
    for (var x = 0; x < shownNegs.length; x++) {
        if (!shownNegs[x].isMine && shownNegs[x].isShown === false) {

            shownNegs[x].isShown = true
            gGame.shownCount++
        }



    }
}

function onCellMark(isMarked, i, j) {
    if (gGame.isOn === true)
        if (gBoard[i][j].isShown === true) return
    if (isMarked === true) {
        return

    }
    if (isMarked === false) {

        gBoard[i][j].isMarked = true
        gGame.markedCount++
    }
    renderBoard(gBoard, '.board')
    isWin()
}

function gameOVer() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard, '.board')
    document.querySelector('.emoji').style.display = 'none'
    var loseBtn = document.querySelector('.loseBtn')
    loseBtn.style.display = 'block'

}
function isWin() {
    var boardCount = 0
    var winBtn = document.querySelector('.winBtn')

    var modal = document.querySelector('.buttons')

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            boardCount++
        }
    }
    if (gGame.markedCount + gGame.shownCount === boardCount) {
        console.log('you won');
        document.querySelector('.emoji').style.display = 'none'
        winBtn.style.display = 'block'
    }

}