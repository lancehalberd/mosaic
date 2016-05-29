
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
        context.fillStyle = colors[tile.colors[i]];
        context.fill();
        context.stroke();
    }
}


function drawAllTiles(context, allTiles) {
    centerBoard();
    context.fillStyle = '#999';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    for (var i = 0; i < allTiles.length; i++) {
        var tile = allTiles[i]
        context.save();
        context.globalAlpha = tile.container === hands[turn ^ 1] ? .3 : 1;
        drawTile(context, tile);
        context.restore();
        if (tile === selectedTile) {
            context.save();
            context.lineWidth = 3;
            context.strokeStyle = highlightColors[turn];
            context.beginPath();
            context.rect(tile.x, tile.y, tile.size, tile.size);
            context.stroke();
            context.restore();
        }
    }
}

function drawLegalMoves(context, legalPositions, legalPositionsWithRotation) {
    context.save();
    context.beginPath();
    context.fillStyle = highlightColors[turn];
    context.strokeStyle = highlightColors[turn];
    context.lineWidth = 3;
    context.globalAlpha = .8;
    for (var i = 0; i < legalPositionsWithRotation.length; i++) {
        var tileCoords = getTopLeftBoardTileCoords(legalPositionsWithRotation[i].boardTileX, legalPositionsWithRotation[i].boardTileY);
        context.rect(tileCoords.x, tileCoords.y, tileSize, tileSize);
        context.stroke();
    }
    for (var i = 0; i < legalPositions.length; i++) {
        var tileCoords = getTopLeftBoardTileCoords(legalPositions[i].boardTileX, legalPositions[i].boardTileY);
        context.fillRect(tileCoords.x, tileCoords.y, tileSize, tileSize);
    }
    context.restore();
}