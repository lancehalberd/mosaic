'use strict';

var $canvas = $('.js-canvas');
var canvasWidth = $canvas.width();
var canvasHeight = $canvas.height();

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

var sampleTile = [0, 1, 0, 1];

game.board = {'left': 100, 'top': 0,
            // Dimensions of the board.
            'width': 800, 'height': 600, 'hash': {},
            // Current values to translate the pieces on the board by
            'translateX': 0, 'translateY': 0,
            // Values the translate values are easing towards
            'targetTranslateX': 0, 'targetTranslateY': 0,
            'tilesPlaced': 0, 'totalTilesInGame': 16
};

var tileCounter = 0;

function makeTile(colors) {
	tileCounter++;
    return {
        // intrinsic properties
    	'id': tileCounter,
        'colors': colors,
        'boardTileX': 0, 'boardTileY': 0,
        'container': null,
        // display properties
        'x': 0, 'y': 0,
        'size': game.tileSize
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

game.hands =[
    [[0,0,0,0], [1,1,1,1], [1,0,0,0], [0,1,1,1], [1,1,0,0], [0,0,1,1], [1,0,1,0], [0,1,0,1]],
    [[0,0,0,0], [1,1,1,1], [1,0,0,0], [0,1,1,1], [1,1,0,0], [0,0,1,1], [1,0,1,0], [0,1,0,1]]
];
game.tilesOnBoard = [];

game.hands[0] = game.hands[0].map(makeTile);
game.hands[1] = game.hands[1].map(makeTile);

game.allTiles = game.hands[0].concat(game.hands[1]);

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

function initializePlayerHand(context, handID) {
	var x;
	var y;
	var tileSize = 70;
	var padding = 4;
	
	if(handID === 0) {
		x = 5;
		y = 5;
	} else if(handID === 1) {
		x = canvasWidth - 5 - 70;
		y = 5;
	}
	
	initializeHand(context, game.hands[handID], handID, x, y, tileSize, padding);
}

function initializeHand(context, hand, handID, x, y, tileSize, padding) {
    for (var i = 0; i < hand.length; i++) {
        hand[i].size = tileSize;
        hand[i].container = {"type": "hand", "id": handID};
        hand[i].x = x;
        hand[i].y = y + i * (hand[i].size + padding);
    }
}

function centerBoard() {
    if (game.tilesOnBoard.length === 0) {
        game.board.translateX = game.board.translateY = 0;
        return;
    }
    var left = canvasWidth, right = 0, top = canvasHeight, bottom = 0;
    for (var i = 0; i < game.tilesOnBoard.length; i++) {
        var tile = game.tilesOnBoard[i];
        left = Math.min(left, tile.x);
        right = Math.max(right, tile.x + tile.size);
        top = Math.min(top, tile.y);
        bottom = Math.max(bottom, tile.y + tile.size);
    }
    game.board.targetTranslateX = game.board.translateX - (right + left) / 2 + (game.board.left + game.board.width / 2);
    game.board.targetTranslateY = game.board.translateY - (bottom + top) / 2 + (game.board.top + game.board.height / 2);
}

function edgeNeighborTile(tile, edge) {
	var dx = 0;
	var dy = 0;
	if(edge === 0) {
		dy = -1;
	} else if(edge === 1) {
		dx = 1;
	} else if(edge === 2) {
		dy = 1;
	} else if(edge === 3) {
		dx = -1;
	} else {
		throw "invalid edge value: " + edge;
	}
	
    var tx = tile.boardTileX + dx;
    var ty = tile.boardTileY + dy;
    var key = boardHashKeyCoords(tx, ty);
    var neighborTileID = game.board.hash[key].id;
    for(var ofst = 0;ofst < game.allTiles.length;ofst++) {
    	var neighborTile = game.allTiles[ofst];
    	if(neighborTile.id === neighborTileID) {
    		console.log("tile id " + tile.id + ", neighbor id" + neighborTile.id);
    		return neighborTile;
    	}
    }
    return null;
}

function pointInTile(tile, x, y) {
    return x >= tile.x && x <= tile.x + tile.size && y >= tile.y && y <= tile.y + tile.size;
}

/**
 * edge of tile nearest (x, y).
 * @param tile
 * @param x
 * @param y
 * @returns {Boolean}
 */
function pointInTileEdge(tile, x, y) {
    if (! pointInTile(tile, x, y) ) {
    	throw "click point (" + x + "," + y + ") is not in " + tile;
    }
    
    var topDistance = y - tile.y;
    var rightDistance = tile.x + tile.size - x;
    var bottomDistance = tile.y + tile.size - y;
    var leftDistance = x - tile.x;
    
    if(topDistance <= rightDistance) {
    	if(topDistance <= bottomDistance) {
    		if(topDistance <= leftDistance) {
    			return 0; // top
    		} else {
    			return 3; // left
    		}
    	} else if(bottomDistance <= leftDistance) {
    		return 2; // bottom
    	} else {
    		return 3; // left
    	}
    } else if(rightDistance <= bottomDistance) {
    	if(rightDistance <= leftDistance) {
			return 1; // right
		} else {
			return 3; // left
		}
	} else if(bottomDistance <= leftDistance) {
		return 2; // bottom
	} else {
		return 3; // left
	}
}

function pointInBoardTile(boardTileX, boardTileY, x, y) {
    var coords = getTopLeftBoardTileCoords(boardTileX, boardTileY);
    return x >= coords.x && x <= coords.x + game.tileSize && y >= coords.y && y <= coords.y + game.tileSize;
}

function lastPlacedTiles(tile1, tile2) {
	var sortedTile1 = tile1;
	var sortedTile2 = tile2;
	
	if(tile1.boardTileX > tile2.boardTileX
			|| (tile1.boardTileX === tile2.boardTileX && tile1.boardTileY > tile2.boardTileY)) {
		sortedTile1 = tile2;
		sortedTile2 = tile1;
	}
	
	return game.lastPlacedTile1 === sortedTile1 && game.lastPlacedTile2 === sortedTile2;
}

function placeTileInHand(tile) {
    tile.inHand = true;
    removeTileFromContainer(tile);
    game.board.tilesPlaced--;
    tile.boardTileX = 0;
    tile.boardTileY = 0;
    tile.container = {"type":"hand", "id":game.turn};
    game.hands[game.turn].push(tile);
}

function placeTileOnBoard(tile, boardTileX, boardTileY) {
	tile.inHand = false;
	if(tile.container.type === "hand") {
		tile.boardTileX = boardTileX;
		tile.boardTileY = boardTileY;
		game.board.hash[boardHashKey(tile)] = tile;
		game.tilesOnBoard.push(tile);
		removeTileFromContainer(tile);
		tile.container = {"type":"board"};
		game.lastTilePlaced = tile;
		tile.size = game.tileSize;
		game.board.tilesPlaced ++;
	} else if(tile.container.type == "board") {
		removeTileFromBoardHash(tile);
		tile.boardTileX = boardTileX;
		tile.boardTileY = boardTileY;
		game.board.hash[boardHashKey(tile)] = tile;		
	} else {
		throw "invalid container type " + tile.container.type;
	}
	var coords = getTopLeftBoardTileCoords(tile.boardTileX, tile.boardTileY);
	tile.x = coords.x;
	tile.y = coords.y;
	adjustGameState();
	conditionallyScoreGame();
}

function adjustGameState() {
	var inputState = game.state;
	
	if(game.state === "build"
		&& game.board.tilesPlaced === game.board.totalTilesInGame) {
		game.state = "transform"; // next transform player should select a pair of tiles to replace.
		game.lastTilePlaced = null;
	} else if(game.state === "transform" && game.replacements.length > 0) {
		game.state = "replace"; // current transform/resolve player should move replacement tiles to transform positions.
	} else if(game.state === "replace" && game.replacements.length === 0) {
		game.state = "rebuild"; // current transform/resolve player should place hand tile(s) in board
		setupRebuildState();
	} else if(game.state === "rebuild" && game.board.tilesPlaced === game.board.totalTilesInGame) {
		if(game.mismatches.length > 0) {
			game.state = "resolve"; // next resolve player should select a board-color-constraint-violating tile to resolve (or 'fix').
			setupResolveState();
			game.turn = game.turn + 1 % 2;
		} else {
			game.state = "transform"; // next transform player should start a transformation.
			game.turn = game.turn + 1 % 2;
		}
	} else if(game.state === "resolve" && game.replacements.length > 0) {
		game.state = "replace"; // current resolve player should move replacement tile(s) to violation positions.
	}
	
	console.log("adjust game state from: " + inputState + " to: " + game.state);
}

function setupResolveState() {
	var mismatchPositions = [];
	for(var ofst = 0;ofst < game.mismatches.length;ofst ++) {
		var mismatchTile = game.mismatches[ofst];
		mismatchPositions.push({
			"boardTileX":mismatchTile.boardTileX,
			"boardTileY":mismatchTile.boardTileY,
			"constraints":mismatchTile.colors});
	}
}

function setupRebuildState() {
	// find shape holes that must be filled.
	legalPositions = [];
	legalPositionsWithRotation = findShapeViolationPositions();
	
	findReplacements(game.hands[game.turn], legalPositionsWithRotation);
	
	if(game.irreplaceables.length > 0) {
		// setup legalPositionsWithRotation from game.irreplaceables.
		legalPositionsWithRotation = [];
		for(var ofst = 0;ofst < game.irreplaceables.length;ofst++) {
			var irreplaceable = game.irreplaceables[ofst];
			var legalPosition = {"boardTileX":irreplaceable.boardTileX, 
					"boardTileY":irreplaceable.boardTileY, 
					"constraints":irreplaceable.colors,
					"replacements":irreplaceable.replacements,
					"minimumMismatch":irreplaceable.minimumMismatch};
			legalPositionsWithRotation.push(legalPosition);
		}
	}
	
	console.log("setupRebuildState: legalPositionsWithRotation");
	console.log(legalPositionsWithRotation);
	
	drawAllTiles(context, game.allTiles);
	drawLegalMoves(context, legalPositions, legalPositionsWithRotation);

}

function removeTileFromContainer(tile) {
	var containerInfo = tile.container;
	var container = null;
	if(containerInfo.type === "hand") {
		container = game.hands[containerInfo.id];
	} else if(containerInfo.type === "board") {
		container = game.tilesOnBoard;
		removeTileFromBoardHash(tile);
	} else {
		throw "invalid container type " + containerInfo.type;
	}
	
    container.splice(container.indexOf(tile), 1);
    console.log(game);
}

function removeTileFromBoardHash(tile) {
	var newHash = {};
	var removeKey = boardHashKey(tile);
	console.log("remove from game.board.hash the tile with key " + removeKey);
	for(var key in game.board.hash) {
		if(key != removeKey) {
			var copyTile = game.board.hash[key];
			newHash[key] = copyTile;
		} else {
			console.log("   found in game.board.hash the tile with key " + removeKey);
		}
	}
	game.board.hash = newHash;
}

function boardHashKey(tile) {
    return boardHashKeyCoords(tile.boardTileX, tile.boardTileY);
}

function boardHashKeyCoords(boardTileX, boardTileY) {
    return 'x' + boardTileX + 'y' + boardTileY;
}

function getTopLeftBoardTileCoords(boardTileX, boardTileY) {
    return {'x': game.board.left + game.board.translateX + game.board.width / 2 + (boardTileX - .5) * game.tileSize, 'y': game.board.top + game.board.translateY + game.board.height / 2 + (boardTileY - .5) * game.tileSize};
}

initializePlayerHand(context, 0);
initializePlayerHand(context, 1);
drawAllTiles(context, game.allTiles);

$('.js-canvas').on('click', function (event) {
    var x = event.pageX - $(this).offset().left;
    var y = event.pageY - $(this).offset().top;
    for (var i = 0; i < game.allTiles.length; i++) {
        if (pointInTile(game.allTiles[i], x, y)) {
            onClickTile(game.allTiles[i], x, y);
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
function onClickTile(tile, clickX, clickY) {
	console.log("on click game.state: " + game.state + ", tile ID " + tile.id);

    if (tile === selectedTile) {
        selectedTile.colors = rotateRight(selectedTile.colors);
    }
    if (game.state === "build" && tile.container.type === "hand" && tile.container.id == game.turn) {
        if (game.tilesOnBoard.length === 0) {
            placeTileOnBoard(tile, 0, 0);
            game.turn ^= 1;
            drawAllTiles(context, game.allTiles);
        } else {
            selectedTile = tile;
            drawAllTiles(context, game.allTiles);
            var rotatePiece = false;
            legalPositions = findLegalPositions(tile, rotatePiece);
            legalPositionsWithRotation = findLegalPositions(tile, rotatePiece = true);
            drawLegalMoves(context, legalPositions, legalPositionsWithRotation);
        }
        adjustGameState();
    } if (game.state === "rebuild" && tile.container.type === "hand" && tile.container.id == game.turn) {
    	console.log("rebuild game");
    	console.log(game);
    	selectedTile = tile;
    	legalPositions = findViolationPositions(tile);
    	drawAllTiles(context, game.allTiles);
    	drawLegalMoves(context, legalPositions, legalPositionsWithRotation);

    	adjustGameState();
    } else if (tile.container.type === "board" && game.state === "transform") {
    	onClickTileTransform(tile, clickX, clickY);
    } else if (tile.container.type === "board" && game.state === "replace") {
    	onClickTileReplaceFromBoard(tile, clickX, clickY);
    }
}

function onClickTileReplaceFromBoard(tile, clickX, clickY) {
    selectedTile = tile;
    drawAllTiles(context, game.allTiles);
    var rotatePiece = false;
    var tileColors = tile.colors;
    legalPositions = [];
    for(var ofst = 0;ofst < legalPositionsWithRotation.length;ofst++) {
    	var candidate = legalPositionsWithRotation[ofst];
    	var colorConstraints = candidate.constraints;
    	if(tileColorsMatchConstraintColors(tileColors, colorConstraints)) {
    		legalPositions.push(candidate);
    	}
    }
    drawLegalMoves(context, legalPositions, legalPositionsWithRotation);
	
}

function onClickTileTransform(tile, clickX, clickY) {
	// select an edge to transform
	
	// determine 'edge': for tile containing click, the edge nearest the click.
	var edge = pointInTileEdge(tile, clickX, clickY);
	var edgeColor = tile.colors[edge];
	console.log("edge " + edge + ", color " + edgeColor + ", turn " + game.turn);
	
	// if the edge color != turn color then ignore click
	
	if(edgeColor == game.turn) {
		return;
	}
	
	// find neighboring tile from edge
	
    var neighborTile = edgeNeighborTile(tile, edge);
	
	// if the edge does not have a neighboring tile then ignore click
    if (!ifdefor(neighborTile)) {
    	return;
    }
    
	// if this tile and neighbor tile were placed by the previous player then ignore click
	if(lastPlacedTiles(tile, neighborTile)) {
		return;
	}
	
	// mark removed tile locations as 'replacement positions' with color constraints.
	// Do this mark before moving the marked tiles to hands so that the boardTileX and
	// boardTileY values are 'in the board'.
	
	// The replacement positions are marked by recording them in the legalPositions
	// global array, same as is used for guiding the placement of tiles from the hands
	// during the 'build' state of the game.
	
	// edit copy of tile colors
	var tileReplacementColors = tile.colors.slice();
	tileReplacementColors[edge] = game.turn; // force edge color to be same as current turn.
	
	var legalTile = 
	{"boardTileX":tile.boardTileX, "boardTileY":tile.boardTileY, 
			"constraints":tileReplacementColors};
	
	var neighborTileReplacementColors = neighborTile.colors.slice();
	neighborTileReplacementColors[(edge + 2) % 4] = game.turn; // force edge color to be same as current turn.

	var legalNeighborTile = 
	{"boardTileX":neighborTile.boardTileX, "boardTileY":neighborTile.boardTileY,
			"constraints":neighborTileReplacementColors};
	
	legalPositions = [];
	legalPositionsWithRotation = [legalTile, legalNeighborTile];
	console.log("legal with rotation");
	console.log(legalPositionsWithRotation);
	
	// move click tile and edge neighbor tile to current turn hand.
	placeTileInHand(tile);
	placeTileInHand(neighborTile);
	initializePlayerHand(context, game.turn);
	
	// find and 'mark' candidate replacement tiles in board
	findReplacements(game.tilesOnBoard, [legalTile, legalNeighborTile]);
	
	drawAllTiles(context, game.allTiles);
	drawLegalMoves(context, legalPositions, legalPositionsWithRotation);
	
	// set game state to indicate that the next click must be to choose among the candidate replacement tiles
	adjustGameState();
}

function onClickLegalPosition(legalPosition) {
	var colorConstraints = legalPosition.constraints;
	placeTileOnBoard(selectedTile, legalPosition.boardTileX, legalPosition.boardTileY);
	selectedTile = null;
	if(game.state === "replace") {
		console.log("onClickLegalPosition: legal with rotation (before) = ");
		console.log(legalPositionsWithRotation);
		var remainingLegalPositionsWithRotation = [];
		for(var ofst = 0;ofst < legalPositionsWithRotation.length;ofst++) {
			var checkLegalPosition = legalPositionsWithRotation[ofst];
			if(checkLegalPosition.boardTileX != legalPosition.boardTileX
					|| checkLegalPosition.boardTileY != legalPosition.boardTileY) {
				remainingLegalPositionsWithRotation.push(checkLegalPosition);
			}
		}
		legalPositions = [];
		legalPositionsWithRotation = remainingLegalPositionsWithRotation;

		findReplacements(game.tilesOnBoard, legalPositionsWithRotation);
		adjustGameState(); // may transition to 'rebuild' to place tiles from hand.
	} else if(game.state === "rebuild") {
		var localMismatches = findNeighborColorViolations(selectedTile, legalPosition);
		addMismatches(localMismatches);
		if(game.hands[game.turn].length > 0) {
			setupRebuildState();
		}

		adjustGameState(); // may transition to 'transform', 'resolve', or stay in 'rebuild'.
	} else {
		legalPositions = [];
		legalPositionsWithRotation = [];
		game.turn ^= 1;
	}
	drawAllTiles(context, game.allTiles);
	drawLegalMoves(context, legalPositions, legalPositionsWithRotation);
	return;
}

function addMismatches(localMismatches) {
	var newMismatches = [];
	for(var localOfst = 0;localOfst < localMismatches.length;localOfst++) {
		var localMismatch = localMismatches[localOfst];
		var localAlreadyInGame = false;
		for(var gameOfst = 0;gameOfst < game.mismatches.length;gameOfst++) {
			var gameMismatch = game.mismatches[gameOfst];
			if(localMismatch.id === gameMismatch.id) {
				localAlreadyInGame = true;
				break;
			}
		}
		
		if(!localAlreadyInGame) {
			game.mismatches.push(localMismatch);
		}
	}
}

function findNeighborColorViolations(tile, legalPosition) {
	var tileColors = tile.colors;
	var colorConstraints = legalPosition.constraints;
	var mismatches = [];
    for (var positionOffset = 0; positionOffset < 4; positionOffset++) {
        var colorOffset = colorConstraints[positionOffset]
        if (colorOffset >= 0 && colorOffset != tileColors[positionOffset]) {
        	var mismatchedTile = edgeNeighborTile(tile, positionOffset);
        	var mismatchedPosition = {
            		"boardTileX":mismatchedTile.boardTileX,
            		"boardTileY":mismatchedTile.boardTileY,
            		"constraints":mismatchedTile.colors,
            		"forcedColors":[-1,-1,-1,-1]};
        	mismatchedPosition.forcedColors[oppositePositionOfst] = tileColors[positionOffset];
        	game.resolvePositions.push(mismatchedPosition);
        	game.mismatches.push(mismatchedTile);
        }
    }
}

function findReplacements(tileArray, positions) {
	game.replacements = [];
	console.log("replace colors");
	console.log(positions);
	
	var replacedColors = [];
	
    for (var i = 0; i < tileArray.length; i++) {
        var placedTile = tileArray[i];
        // copy so we can rotate without changing the original.
        var rotatedColors = placedTile.colors.slice();
        for (var rotationAttempts = 0; rotationAttempts < 4; rotationAttempts++) {
        	var colorMatch = false;
        	for(var colorsOfst = 0;colorsOfst < positions.length;colorsOfst++) {
        		var colorsCheck = positions[colorsOfst].constraints;
        		if(tileColorsMatchConstraintColors(rotatedColors, colorsCheck)) {
        			colorMatch = true;
        			replacedColors.push[colorsCheck];
        		}
        	}
        	
            if (colorMatch) {
                game.replacements.push(placedTile);
                break;
            }
            rotatedColors = rotateRight(rotatedColors);
        }

    }
    
    if(replacedColors.length < positions.length) {
    	// a color constraint could not be matched.
    	// Find the tiles in tileArray that are minimally mis-matched.
    	game.replacements = []; // undo any identified replacements.

    	game.irreplaceables = [];
    	for(var ofst = 0;ofst < positions.length;ofst++) {
    		var colors = positions[ofst].constraints;
    		var colorsAreReplaceable = false;
    		for(var replacedOfst = 0;replacedOfst < replacedColors.length;replacedColors++) {
    			var replaced = replacedColors[replacedOfst];
    			if(replaced === colors) {
    				colorsAreReplaceable = true;
    				break;
    			}
    		}
    		
    		if(! colorsAreReplaceable) {
    			var position = positions[ofst];
    			game.irreplaceables.push({"boardTileX":position.boardTileX, "boardTileY":position.boardTileY, "colors": colors, "minimumMismatch": 5, "replacements":[]});
    		}
    	}
    	
    	for(var colorsOfst = 0;colorsOfst < game.irreplaceables.length;colorsOfst++) {
			var irreplaceable = game.irreplaceables[colorsOfst];
    		for (var i = 0; i < tileArray.length; i++) {
    			var placedTile = tileArray[i];
    			// copy so we can rotate without changing the original.
    			var rotatedColors = placedTile.colors.slice();
    			var tileHasBeenIdentifiedAsReplacement = false;
    			for (var rotationAttempts = 0; rotationAttempts < 4; rotationAttempts++) {
    				var mismatch = tileColorsMismatchConstraintColors(rotatedColors, irreplaceable.colors);
    				if(mismatch < irreplaceable.minimumMismatch) {
    					irreplaceable.replacements = [placedTile];
    					irreplaceable.minimumMismatch = mismatch;
    					tileHasBeenIdentifiedAsReplacement = true;
    				} else if(mismatch === irreplaceable.minimumMismatch && ! tileHasBeenIdentifiedAsReplacement) {
    					irreplaceable.replacements.push(placedTile);
    					tileHasBeenIdentifiedAsReplacement = true;
    				}
        			rotatedColors = rotateRight(rotatedColors);
    			}
    		}
    	}

    	for(var irreplaceableOfst = 0;irreplaceableOfst < game.irreplaceables.length;irreplaceableOfst++) {
    		var irreplaceable = game.irreplaceables[irreplaceableOfst];
    		for(var replacementOfst = 0;replacementOfst < irreplaceable.replacements.length; replacementOfst++) {
    			var replacement = irreplaceable.replacements[replacementOfst];
    			var replacementAlreadyRegistered = false;
    			for(var gameOfst = 0;gameOfst < game.replacements.length;gameOfst++) {
    				var registeredReplacement = game.replacements[gameOfst];
    				if(registeredReplacement === replacement) {
    					replacementAlreadyRegistered = true;
    					break;
    				}
    			}
    			
    			if(! replacementAlreadyRegistered) {
    				game.replacements.push(replacement);
    			}
    		}
    	}
    	
    }
}

function findViolationPositions(tile) {
	var candidateSpaces = [];
	var allowedMismatch = 5; // bigger than any actual mismatch.
	for(var ofst = 0;ofst < legalPositionsWithRotation.length;ofst++) {
		var violationPosition = legalPositionsWithRotation[ofst];
		var tileCanMinimallyMismatchPosition = false;
		for(var replaceOfst = 0;replaceOfst < violationPosition.replacements.length;replaceOfst++) {
			var replaceTile = violationPosition.replacements[replaceOfst];
			if(replaceTile.id === tile.id) {
				tileCanMinimallyMismatchPosition = true;
				break;
			}
		}
		
		if(tileCanMinimallyMismatchPosition && violationPosition.minimumMismatch <= allowedMismatch) {
			if(violationPosition.minimumMismatch < allowedMismatch) {
				allowedMismatch = violationPosition.minimumMismatch;
				// discard previously recorded candidate spaces - they have mismatches
				// larger than the current violationPosition.
				candidateSpaces = [];
			}
			candidateSpaces.push(violationPosition);
		}
	}

	var matchedPositions = [];
	$.each(candidateSpaces, function (hashKey, candidateSpace) {
		var colorConstraints = candidateSpace.constraints;
		var minimumMismatch = candidateSpace.minimumMismatch;
		var mismatch = tileColorsMismatchConstraintColors(tile.colors, colorConstraints);
		if (mismatch <= minimumMismatch) {
			matchedPositions.push(candidateSpace);
		}
	});

    return matchedPositions;
}

function findLegalPositions(tile, rotatePiece) {
    var candidateSpaces = {}
    for (var i = 0; i < game.tilesOnBoard.length; i++) {
        var placedTile = game.tilesOnBoard[i];
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                var tx = placedTile.boardTileX + dx;
                var ty = placedTile.boardTileY + dy;
                var key = boardHashKeyCoords(tx, ty);
                if (!ifdefor(game.board.hash[key])) {
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
                        candidateSpace.byLastTilePlaced = ifdefor(candidateSpace.byLastTilePlaced, false) || game.lastTilePlaced === placedTile;
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
        if (!colorConstraints || candidateSpace.neighbors < Math.min(2, game.tilesOnBoard.length)) {
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

function findShapeViolationPositions() {
	console.log("findShapeViolationPositions");
	console.log(game);
	
    var candidateSpaces = {}
    for (var i = 0; i < game.tilesOnBoard.length; i++) {
        var placedTile = game.tilesOnBoard[i];
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                var tx = placedTile.boardTileX + dx;
                var ty = placedTile.boardTileY + dy;
                var key = boardHashKeyCoords(tx, ty);
                if (!ifdefor(game.board.hash[key])) {
                    var candidateSpace = ifdefor(candidateSpaces[key], {'boardTileX': tx, 'boardTileY': ty, 'orthogonalNeighbors': 0});
                    if (dx === 0 || dy === 0) {
                    	console.log("space (" + candidateSpace.boardTileX + "," + candidateSpace.boardTileY + ") has ortho neighbor (" + placedTile.boardTileX + "," + placedTile.boardTileY + ")");
                        candidateSpace.orthogonalNeighbors++;
                        var placedPositionOffset = (dy < 0) ? 0
                                                         : ((dy > 0) ? 2
                                                                     : ((dx < 0) ? 3 : 1));
                        var constrainedPositionOffset = (placedPositionOffset + 2) % 4;
                        var colorOffset = placedTile.colors[placedPositionOffset];
                        candidateSpace.constraints = ifdefor(candidateSpace.constraints, [-1,-1,-1,-1]);
                        candidateSpace.constraints[constrainedPositionOffset] = colorOffset;
                        candidateSpace.byLastTilePlaced = ifdefor(candidateSpace.byLastTilePlaced, false) || game.lastTilePlaced === placedTile;
                        candidateSpaces[key] = candidateSpace;
                    }
                }
            }
        }
    }
    console.log("candidateSpaces");
    console.log(candidateSpaces);
    var legalPositions = [];
    $.each(candidateSpaces, function (hashKey, candidateSpace) {
        var colorConstraints = candidateSpace.constraints;
        if (!colorConstraints || candidateSpace.orthogonalNeighbors < 3) {
            return;
        }
        legalPositions.push(candidateSpace);
    });
    return legalPositions;
}

function tileColorsMatchConstraintColors(tileColors, colorConstraints) {
	var mismatches = tileColorsMismatchConstraintColors(tileColors, colorConstraints);
	var tileMatches = (mismatches === 0);
	return tileMatches;
}

function tileColorsMismatchConstraintColors(tileColors, colorConstraints) {
	var mismatches = 0;
    for (var positionOffset = 0; positionOffset < 4; positionOffset++) {
        var colorOffset = colorConstraints[positionOffset]
        if (colorOffset >= 0 && colorOffset != tileColors[positionOffset]) {
        	mismatches++;
        }
    }
    return mismatches;
}

/**
 * Run repeatedly to shift the display of the board from old position to
 * new center.
 * Current position: game.board.translateX, game.board.translateY
 * New (target) position: game.board.targetTranslateX, game.board.targetTranslateY
 * @author brewer
 */
function gameLoop() {
    if (game.board.translateX !== game.board.targetTranslateX || game.board.translateY !== game.board.targetTranslateY) {
        game.board.translateX = (game.board.translateX * 3 + game.board.targetTranslateX) / 4;
        game.board.translateY = (game.board.translateY * 3 + game.board.targetTranslateY) / 4;
        if (Math.abs(game.board.translateX - game.board.targetTranslateX) < 1) {
            game.board.translateX = game.board.targetTranslateX;
        }
        if (Math.abs(game.board.translateY - game.board.targetTranslateY) < 1) {
            game.board.translateY = game.board.targetTranslateY;
        }

        for (var i = 0; i < game.tilesOnBoard.length; i++) {
            var tile = game.tilesOnBoard[i];
            var coords = getTopLeftBoardTileCoords(tile.boardTileX, tile.boardTileY);
            tile.x = coords.x;
            tile.y = coords.y;
        }
        drawAllTiles(context, game.allTiles);
        drawLegalMoves(context, legalPositions, legalPositionsWithRotation);
    }
}

/**
 * Run the gameLoop every 30 milliseconds. This smoothly  re-centers the display of the board.
 */
setInterval(gameLoop, 30);

function saveGame() {
	console.log(game);
	var gameJSONString = JSON.stringify(game);
	 window.localStorage.setItem("gameState", gameJSONString); 
}

function loadGame() {
	var gameJSONString = window.localStorage.getItem("gameState"); 
	game = JSON.parse(gameJSONString);
	// the tiles in allTiles are now different objects from the tiles
	// in hands and tilesOnBoard.
	// Re-populate 'hands' and 'tilesOnBoard' from allTiles.
	game.hands = [[],[]];
	game.tilesOnBoard = [];
	for(var tileKey in game.allTiles) {
		var tile = game.allTiles[tileKey];
		if(tile.container.type === "board") {
			game.tilesOnBoard.push(tile);
		} else if(tile.container.type === "hand") {
			game.hands[tile.container.id].push(tile);
		} else {
			throw "unknown tile container type " + tile.container.type;
		}
	}
	console.log(game);
	drawAllTiles(context, game.allTiles);
	adjustGameState();
    conditionallyScoreGame();

}

function conditionallyScoreGame() {
	if(game.state === "transform") {
    	var score = graphAndScore(game.allTiles);
    	console.log(score);
    	$('.score-0').html(score[0]);
    	$('.score-1').html(score[1]);
    }
}