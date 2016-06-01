var game = {
		"allTiles":[],
		"hands":[],
		"tilesOnBoard":[],
		"turn":0,
		"board":{},
		"lastTilePlaced":{},
		"tileSize":100
}

function graphAndScore(gameTiles) {
    var g = new Graph();
    g.edgeFactory.template.style.directed = false;

    var tileNames = {};
//	console.log("new graph");

	for(var tileKey in gameTiles) {
		var tile = gameTiles[tileKey];

		var tileIsCross = true;
		for(var ofst = 0;ofst < tile.colors.length;ofst++) {
			var nextOfst = (ofst + 1) % 4;
			if(tile.colors[ofst] === tile.colors[nextOfst]) {
				tileIsCross = false;
			}
		}

		for(var ofst = 0;ofst < tile.colors.length;ofst++) {
		//var ofst = 0;
			var tileName = "t" + tile.id 
			+ (tileIsCross ? (":" + ofst) : "")
			+ "-" + tile.colors[ofst];
			
			tileNames[tileName] = tile.colors[ofst];

			var edgeName = "e" + tile.id + ":" + ofst;
			g.addEdge(tileName, edgeName);
		}
		
		// check orthogonal neighboring tiles for 
		// connections.
		
		for(var ofst = 0;ofst < tile.colors.length;ofst++) {
	        for (var dy = -1; dy <= 1; dy++) {
	            for (var dx = -1; dx <= 1; dx++) {
	                var tx = tile.boardTileX + dx;
	                var ty = tile.boardTileY + dy;
	                var key = boardHashKeyCoords(tx, ty);
	                if (ifdefor(game.board.hash[key])) {
	                    if (dx === 0 || dy === 0) {
	                    	var otherTile = game.board.hash[key];
	                    	// orthogonal location
	                        var placedPositionOffset = (dy < 0) ? 0
                                    : ((dy > 0) ? 2
                                                : ((dx < 0) ? 3 : 1));
	                        var otherPositionOffset = (placedPositionOffset + 2) % 4;

	            			var edgeName = "e" + tile.id + ":" + placedPositionOffset;
	            			var otherEdgeName = "e" + otherTile.id + ":" + otherPositionOffset;
	            			
	            			// avoid adding the same edge twice with the
	            			// ends swapped - the edges are meant to be undirected.
	            			if(tile.id < otherTile.id) {
	            				g.addEdge(edgeName, otherEdgeName);
	            			}
	                    }
	                }
	            }
	        }
		}
	}
	
//	console.log("graph built");
//	console.log(g)
	return score(g, tileNames);
}

function score(g, tiles) {

    /* Step 1: initializing empty path matrix (second dimension is implicit) */
    var adjacency = {};

//    console.log(tiles);

    /* construct path matrix, initialize with 0 and 1 */
    for(j in g.nodes) {
        adjacency[j] = {};
        for(i in g.nodes) {
            adjacency[j][i] = (j === i) ? 1 : 0;
        }
    }   
    
    /* initialize path connections - undirected */
    for(e in g.edges) {
    	var src = g.edges[e].source.id;
    	var tgt = g.edges[e].target.id;
        adjacency[src][tgt] = 1;
        adjacency[tgt][src] = 1;
    }

    /* Step 2: extend connections. 
     * Find the fixed point: run the loop until no more new path extensions occur. 
     */
    var changed = true;
    while(changed) {
    	changed = false;
    	for(k in g.nodes){
    		for(i in g.nodes) {
    			for(j in g.nodes) {
    				if(adjacency[i][j] === 0 && adjacency[i][k] == 1 && adjacency[k][j] == 1) {
    					adjacency[i][j] = 1;
    					adjacency[j][i] = 1;
    					changed = true;
    				}
    			}
    		}
    	}
    }

//    console.log(adjacency);
    /*
     * gather tiles into connected components.
     */
    var componentMap = {};
    var components = [];
    
    
    for(tile in tiles) {
//    	console.log(tile);
    	
    	if(componentMap[tile]) {
//    		console.log("skip - already in map");
    		continue;
    	}
    	
    	
    	var row = adjacency[tile];
//    	console.log("row for " + tile + " = " + row);
    	var component = {};
    	// tN:K-J
    	var adjustedTile = tile.replace(/:\d/, "");
    	component[adjustedTile] = 1;
    	for(node in row) {
    		var adjacent = row[node];
    		var tileNodeColor = tiles[node];
//    		console.log("node " + node);
//    		console.log("adjacent " + adjacent);
//    		console.log("tileNodeColor " + tileNodeColor);
    		if(tileNodeColor != undefined && adjacent) {
    	    	if(componentMap[node]) {
    	    		console.log("unexpected component: " + node);
    	    	}
    	    	var adjustedJ = node.replace(/:\d/, "");
    			component[adjustedJ] = 1;
    	    	componentMap[node] = component;
    		}
    	}
//    	console.log(component);
    	componentMap[tile] = component;
    	components.push(component);
    }
    
//    console.log("map: " + JSON.stringify(componentMap));
    
    var score = [0,0];
       
    for(var ofst = 0;ofst < components.length;ofst++) {
    	var component = components[ofst];
    	var tiles = Object.keys(component);
//    	console.log("a: " + tiles);
    	var size = tiles.length;
//    	console.log(size);
    	if(size > 1) {
    		var tile = tiles[0];
    		var splits = tile.split("-");

    		score[splits[1]] = score[splits[1]] + size * size;
    	}
    }
    
    
    return score;
}
