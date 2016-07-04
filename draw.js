
function drawTile(context, tile) {
    var corners = [[tile.x, tile.y],[tile.x + tile.size, tile.y],[tile.x + tile.size, tile.y + tile.size],[tile.x, tile.y + tile.size]];
    var center = [tile.x + .5 * tile.size, tile.y + .5 * tile.size]
    for (var i = 0; i < 4; i++) {
        var p1 = corners[i];
        var p2 = arrMod(corners, i + 1);
        context.beginPath();
        context.moveTo(p1[0], p1[1]);
        context.lineTo(p2[0], p2[1]);
        context.lineTo(center[0], center[1]);
        context.closePath();
        
        context.save();
        context.fillStyle = colors[tile.colors[i]];
        context.fill();
        context.stroke();
    	var text = "x" + tile.boardTileX + "y" + tile.boardTileY;
    	context.fillStyle = '#000';
    	context.fillText(text, tile.x+5, tile.y+10);
    	context.restore();
    }
}


function drawAllTiles(context, allTiles) {
    centerBoard();
    context.fillStyle = '#999';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    for (var i = 0; i < allTiles.length; i++) {
        var tile = allTiles[i]
        context.save();
        var tileIsInInactiveHand = tile.container.type === "hand" && tile.container.id !== game.turn;
        context.globalAlpha = tileIsInInactiveHand ? .3 : 1;
        drawTile(context, tile);
        context.restore();
        if (tile === selectedTile) {
        	drawSelectedTileMark(context, tile);
        }
        
        for(var ofst = 0;ofst < game.replacements.length;ofst++) {
        	var replacement = game.replacements[ofst];
        	if(replacement.id === tile.id) {
//            	console.log("replacement tile");
//            	console.log(replacement);
            	drawReplacementTileMark(context, tile);
        	}
        }
    }
}

function drawSelectedTileMark(context, tile) {
	var midX = tile.x + (tile.size/2);
	var midY = tile.y + (tile.size/2);
	var adjust = tile.size/4;
	
	var verticalTop = {"x":midX, "y":midY - adjust};
	var verticalBottom = {"x":midX, "y":midY + adjust};
	var horizontalLeft = {"x":midX-adjust, "y":midY};
	var horizontalRight = {"x":midX+adjust, "y":midY};
	
	context.save();
	context.lineWidth = 3;
	context.strokeStyle = highlightColors[game.turn];
	context.beginPath();
	//context.rect(tile.x, tile.y, tile.size, tile.size);
	context.moveTo(verticalTop.x, verticalTop.y);
	context.lineTo(verticalBottom.x, verticalBottom.y);
	context.closePath();
	context.stroke();

	context.beginPath();
	context.moveTo(horizontalLeft.x, horizontalLeft.y);
	context.lineTo(horizontalRight.x, horizontalRight.y);
	context.closePath();
	
	context.stroke();
	context.restore();
}

function drawReplacementTileMark(context, tile) {
	var midX = tile.x + (tile.size/2);
	var midY = tile.y + (tile.size/2);
	var adjust = tile.size/4;
	
	var verticalTop = {"x":midX, "y":midY - adjust};
	var verticalBottom = {"x":midX, "y":midY + adjust};
	var horizontalLeft = {"x":midX-adjust, "y":midY};
	var horizontalRight = {"x":midX+adjust, "y":midY};
	
	context.save();
	context.lineWidth = 3;
	context.strokeStyle = highlightColors[game.turn];
	context.beginPath();
	context.arc(midX, midY, tile.size/4, 0, 2*Math.PI);
	context.closePath();
	context.stroke();
	context.restore();
}

function drawLegalMoves(context, legalPositions, legalPositionsWithRotation) {	
    context.save();
    context.beginPath();
    context.fillStyle = highlightColors[game.turn];
    context.strokeStyle = highlightColors[game.turn];
    context.lineWidth = 3;
    context.globalAlpha = .8;
    for (var i = 0; i < legalPositionsWithRotation.length; i++) {
        var tileCoords = getTopLeftBoardTileCoords(legalPositionsWithRotation[i].boardTileX, legalPositionsWithRotation[i].boardTileY);
        
        context.rect(tileCoords.x, tileCoords.y, game.tileSize, game.tileSize);
        context.stroke();
    }
    for (var i = 0; i < legalPositions.length; i++) {
        var tileCoords = getTopLeftBoardTileCoords(legalPositions[i].boardTileX, legalPositions[i].boardTileY);
        context.fillRect(tileCoords.x, tileCoords.y, game.tileSize, game.tileSize);
    }
    context.restore();
}