'use strict';

var $canvas = $('.js-canvas');
var canvasWidth = $canvas.width();
var canvasHeight = $canvas.height();
var tileSize = 100;
var context = $canvas[0].getContext('2d');
/*context.beginPath();
context.moveTo(0, 0);
context.lineTo(width, height);
context.stroke();

context.beginPath();
context.rect(50, 50, 100, 100);
context.stroke();*/

var colors =[
    '#008800',
    '#4444FF'
];
var highlightColors = [
    '#CCFFCC',
    '#CCCCFF'
];
var turn = 0;
var sampleTile = [0, 1, 0, 1];

var board = {'left': 100, 'top': 0,
            // Dimensions of the board.
            'width': 800, 'height': 600, 'hash': {},
            // Current values to translate the pieces on the board by
            'translateX': 0, 'translateY': 0,
            // Values the translate values are easing towards
            'targetTranslateX': 0, 'targetTranslateY': 0
};

function makeTile(colors) {
    return {
        // intrinsic properties
        'colors': colors,
        'boardTileX': 0, 'boardTileY': 0,
        'container': null,
        // display properties
        'x': 0, 'y': 0,
        'size': tileSize
    };
}

function ifdefor(value, defaultValue) {
    if (value !== undefined) {
        return value;
    }
    if (defaultValue !== undefined) {
        return defaultValue;
    }
    return null;
}

var hands =[
    [[0,0,0,0], [1,1,1,1], [1,0,0,0], [0,1,1,1], [1,1,0,0], [0,0,1,1], [1,0,1,0], [0,1,0,1]],
    [[0,0,0,0], [1,1,1,1], [1,0,0,0], [0,1,1,1], [1,1,0,0], [0,0,1,1], [1,0,1,0], [0,1,0,1]]
];
var tilesOnBoard = [];

hands[0] = hands[0].map(makeTile);
hands[1] = hands[1].map(makeTile);

var allTiles = hands[0].concat(hands[1]);

function rotateRight(tileColors) {
    var newTileColors = tileColors.slice();
    newTileColors.unshift(newTileColors.pop());
    return newTileColors;
}
function rotateLeft(tileColors) {
    var newTileColors = tileColors.slice();
    newTileColors.newTileColors(newTile.shift());
    return newTileColors;
}

function arrMod(array, offset) {
    return array[((offset % array.length + array.length) % array.length)];
}


function initializeHand(context, hand, x, y, tileSize, padding) {
    for (var i = 0; i < hand.length; i++) {
        hand[i].size = tileSize;
        hand[i].container = hand;
        hand[i].x = x;
        hand[i].y = y + i * (hand[i].size + padding);
    }
}

function centerBoard() {
    if (tilesOnBoard.length === 0) {
        board.translateX = board.translateY = 0;
        return;
    }
    var left = canvasWidth, right = 0, top = canvasHeight, bottom = 0;
    for (var i = 0; i < tilesOnBoard.length; i++) {
        var tile = tilesOnBoard[i];
        left = Math.min(left, tile.x);
        right = Math.max(right, tile.x + tile.size);
        top = Math.min(top, tile.y);
        bottom = Math.max(bottom, tile.y + tile.size);
    }
    board.targetTranslateX = board.translateX - (right + left) / 2 + (board.left + board.width / 2);
    board.targetTranslateY = board.translateY - (bottom + top) / 2 + (board.top + board.height / 2);
}

function pointInTile(tile, x, y) {
    return x >= tile.x && x <= tile.x + tile.size && y >= tile.y && y <= tile.y + tile.size;
}

function pointInBoardTile(boardTileX, boardTileY, x, y) {
    var coords = getTopLeftBoardTileCoords(boardTileX, boardTileY);
    return x >= coords.x && x <= coords.x + tileSize && y >= coords.y && y <= coords.y + tileSize;
}

function placeTileOnBoard(tile, boardTileX, boardTileY) {
    tile.inHand = false;
    tile.boardTileX = boardTileX;
    tile.boardTileY = boardTileY;
    board.hash[boardHashKey(tile)] = tile;
    tilesOnBoard.push(tile);
    tile.container.splice(tile.container.indexOf(tile), 1);
    tile.container = tilesOnBoard;
    lastTilePlaced = tile;
    tile.size = tileSize;
    var coords = getTopLeftBoardTileCoords(tile.boardTileX, tile.boardTileY);
    tile.x = coords.x;
    tile.y = coords.y;
}

function boardHashKey(tile) {
    return boardHashKeyCoords(tile.boardTileX, tile.boardTileY);
}

function boardHashKeyCoords(boardTileX, boardTileY) {
    return 'x' + boardTileX + 'y' + boardTileY;
}

function getTopLeftBoardTileCoords(boardTileX, boardTileY) {
    return {'x': board.left + board.translateX + board.width / 2 + (boardTileX - .5) * tileSize, 'y': board.top + board.translateY + board.height / 2 + (boardTileY - .5) * tileSize};
}

initializeHand(context, hands[0], 5, 5, 70, 4);
initializeHand(context, hands[1], canvasWidth - 5 - 70, 5, 70, 4);
drawAllTiles(context, allTiles);

$('.js-canvas').on('click', function (event) {
    var x = event.pageX - $(this).offset().left;
    var y = event.pageY - $(this).offset().top;
    for (var i = 0; i < allTiles.length; i++) {
        if (pointInTile(allTiles[i], x, y)) {
            onClickTile(allTiles[i]);
            return;
        }
    }
    for (var i = 0; i < legalPositions.length; i++) {
        if (pointInBoardTile(legalPositions[i].boardTileX, legalPositions[i].boardTileY, x, y)) {
            onClickLegalPosition(legalPositions[i]);
            return;
        }
    }
});

// Array of legal positions the current player can place the tile they selected.
var legalPositions = [];
var legalPositionsWithRotation = [];
// The currently selected tile will be placed when a player clicks on a legal position.
// It is also rendered differently to stand out.
var selectedTile;
var lastTilePlaced;
function onClickTile(tile) {
    if (tile === selectedTile) {
        selectedTile.colors = rotateRight(selectedTile.colors);
    }
    if (tile.container === hands[turn]) {
        if (tilesOnBoard.length === 0) {
            placeTileOnBoard(tile, 0, 0);
            turn ^= 1;
            drawAllTiles(context, allTiles);
        } else {
            selectedTile = tile;
            drawAllTiles(context, allTiles);
            var rotatePiece = false;
            legalPositions = findLegalPositions(tile, rotatePiece);
            legalPositionsWithRotation = findLegalPositions(tile, rotatePiece = true);
            drawLegalMoves(context, legalPositions, legalPositionsWithRotation);
        }
    }
}

function onClickLegalPosition(legalPosition) {
    var colorConstraints = legalPosition.constraints;
    //for (var rotationAttempts = 0; rotationAttempts < 4; rotationAttempts++) {
    //    if (tileColorsMatchConstraintColors(selectedTile.colors, colorConstraints)) {
            placeTileOnBoard(selectedTile, legalPosition.boardTileX, legalPosition.boardTileY);
            selectedTile = null;
            legalPositions = [];
            turn ^= 1;
            drawAllTiles(context, allTiles);
            return;
     //   }
   //     selectedTile.colors = rotateRight(selectedTile.colors);
    //}
    console.log("Something went wrong, tried 4 rotations and none of them were legal.");
    console.log(legalPosition);
    console.log(selectedTile);
}
function findLegalPositions(tile, rotatePiece) {
    var candidateSpaces = {}
    for (var i = 0; i < tilesOnBoard.length; i++) {
        var placedTile = tilesOnBoard[i];
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                var tx = placedTile.boardTileX + dx;
                var ty = placedTile.boardTileY + dy;
                var key = boardHashKeyCoords(tx, ty);
                if (!ifdefor(board.hash[key])) {
                    var candidateSpace = ifdefor(candidateSpaces[key], {'boardTileX': tx, 'boardTileY': ty, 'neighbors': 0});
                    candidateSpace.neighbors++;
                    if (dx === 0 || dy === 0) {
                        var placedPositionOffset = (dy < 0) ? 0
                                                         : ((dy > 0) ? 2
                                                                     : ((dx < 0) ? 3 : 1));
                        var constrainedPositionOffset = (placedPositionOffset + 2) % 4;
                        var colorOffset = placedTile.colors[placedPositionOffset];
                        candidateSpace.constraints = ifdefor(candidateSpace.constraints, [-1,-1,-1,-1]);
                        candidateSpace.constraints[constrainedPositionOffset] = colorOffset;
                        candidateSpace.byLastTilePlaced = ifdefor(candidateSpace.byLastTilePlaced, false) || lastTilePlaced === placedTile;
                    }
                    candidateSpaces[key] = candidateSpace;
                }
            }
        }
    }
    var legalPositions = [];
    var legalPositionsByLastTilePlaced = [];
    $.each(candidateSpaces, function (hashKey, candidateSpace) {
        var colorConstraints = candidateSpace.constraints;
        if (!colorConstraints || candidateSpace.neighbors < Math.min(2, tilesOnBoard.length)) {
            return;
        }
        // copy so we can rotate without changing the original.
        var rotatedColors = tile.colors.slice();
        for (var rotationAttempts = 0; rotationAttempts < 4; rotationAttempts++) {
            if (tileColorsMatchConstraintColors(rotatedColors, colorConstraints)) {
                legalPositions.push(candidateSpace);
                if (candidateSpace.byLastTilePlaced) {
                    legalPositionsByLastTilePlaced.push(candidateSpace);
                }
                break;
            }
            rotatedColors = rotateRight(rotatedColors);
        }
    });
    legalPositions = legalPositionsByLastTilePlaced.length ? legalPositionsByLastTilePlaced : legalPositions;
    if (rotatePiece) {
        return legalPositions;
    }
    for (var i = 0 ; i < legalPositions.length; i++) {
        if (!tileColorsMatchConstraintColors(tile.colors, legalPositions[i].constraints)) {
            legalPositions.splice(i--, 1);
        }
    }
    return legalPositions;
}

function tileColorsMatchConstraintColors(tileColors, colorConstraints) {
    for (var positionOffset = 0; positionOffset < 4; positionOffset++) {
        var colorOffset = colorConstraints[positionOffset]
        if (colorOffset >= 0 && colorOffset != tileColors[positionOffset]) {
            return false;
        }
    }
    return true;
}

function gameLoop() {
    if (board.translateX !== board.targetTranslateX || board.translateY !== board.targetTranslateY) {
        board.translateX = (board.translateX * 3 + board.targetTranslateX) / 4;
        board.translateY = (board.translateY * 3 + board.targetTranslateY) / 4;
        if (Math.abs(board.translateX - board.targetTranslateX) < 1) {
            board.translateX = board.targetTranslateX;
        }
        if (Math.abs(board.translateY - board.targetTranslateY) < 1) {
            board.translateY = board.targetTranslateY;
        }
        for (var i = 0; i < tilesOnBoard.length; i++) {
            var tile = tilesOnBoard[i];
            var coords = getTopLeftBoardTileCoords(tile.boardTileX, tile.boardTileY);
            tile.x = coords.x;
            tile.y = coords.y;
        }
        drawAllTiles(context, allTiles);
        drawLegalMoves(context, legalPositions, legalPositionsWithRotation);
    }
}

setInterval(gameLoop, 30);
