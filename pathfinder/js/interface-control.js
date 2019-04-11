function setAsSelected(element, forced) {
	if (onGoingSearch() && element) {
		return;
	}
	if (element === selectedElement) {
		return;
	}
	if (selectionBackup && element && !forced) {
		return;
	}
	if (element == null) {
		hideDisplay();
		if (selectedElement instanceof Node) {
			if (nodesSelectable || forced) {
				selectedElement = null;
				canvasUpdated = false;
				handleNodeSelectionChange();
			}
			return;
		} else if (selectedElement instanceof Edge) {
			if (edgesSelectable || forced) {
				selectedElement = null;
				canvasUpdated = false;
			}
			return;
		} else if (selectedElement instanceof Heuristic) {
			if (heuristicsSelectable || forced) {
				selectedElement = null;
				canvasUpdated = false;
			}
			return;
		}
	}
	var prev = selectedElement;
	selectedElement = element;
	var isNode = false;
	if (element instanceof Node) {
		var i = vNodes.indexOf(element);
		var j = vNodes.length - 1;
		var aux = vNodes[i];
		vNodes[i] = vNodes[j];
		vNodes[j] = aux;
		isNode = true;
	} else if (element instanceof Edge) {
		var i = vEdges.indexOf(element);
		var j = vEdges.length - 1;
		var aux = vEdges[i];
		vEdges[i] = vEdges[j];
		vEdges[j] = aux;
	} else if (element instanceof Heuristic) {
		var i = vHeuristics.indexOf(element);
		var j = vHeuristics.length - 1;
		var aux = vHeuristics[i];
		vHeuristics[i] = vHeuristics[j];
		vHeuristics[j] = aux;
	}
	if (isNode || (prev instanceof Node)) {
		handleNodeSelectionChange();
	}
	selectionUpdated = false;
}

function setAsHovered(element) {
	var prev = hoveredElement;
	hoveredElement = element;
	if (prev !== hoveredElement) {
		hoverUpdated = false;
	}
}

function hideSelection() {
	selectionBackup = selectedElement;
	setAsSelected(null);
}

function restoreSelection() {
	var element = selectionBackup;
	selectionBackup = null;
	setAsSelected(element);
}

function setCanvasButtonsVisible(state) {
	if (state != canvasButtonsVisible) {
		canvasButtonsVisible = state;
		canvasUpdated = false;
	}
}

function setAsHoveredButtonIndex(index) {
	if (index != hoveredCanvasButton) {
		hoveredCanvasButton = index;
		canvasUpdated = false;
	}
}

function setAsOrgNode(node) {
	if (node != orgNode && !searchData) {
		if (flagsVisible) {
			canvasUpdated = false;
		}
		orgNode = node;
		graphUpdated = false;
		if (!orgNode || !dstNode || !get("[name=\"search_method\"].active")) {
			addClass("#start_search", "disabled");
		} else {
			removeClass("#start_search", "disabled");
		}
	}
}

function setAsDstNode(node) {
	if (node != dstNode && !searchData) {
		if (flagsVisible) {
			canvasUpdated = false;
		}
		dstNode = node;
		graphUpdated = false;
		if (!orgNode || !dstNode || !get("[name=\"search_method\"].active")) {
			addClass("#start_search", "disabled");
		} else {
			removeClass("#start_search", "disabled");
		}
	}
}

function setNodesSelectable(state) {
	if (state != nodesSelectable) {
		if (!state) {
			setNodesEditable(false);
		}
		nodesSelectable = state;
		if (vNodes.length) {
			if (selectedElement instanceof Node) {
				canvasUpdated = false;
			}
		}
	}
}

function setNodesEditable(state) {
	if (state) {
		setNodesSelectable(true);
	}
	nodesEditable = state;
}

function setEdgesSelectable(state) {
	if (state != edgesSelectable) {
		if (!state) {
			setEdgesEditable(false);
		}
		edgesSelectable = state;
		if (vEdges.length) {
			canvasUpdated = false;
		}
	}
}

function setEdgesEditable(state) {
	if (state) {
		setEdgesSelectable(true);
	}
	edgesEditable = state;
}

function setHeuristicsSelectable(state) {
	if (state != heuristicsSelectable) {
		if (!state) {
			setHeuristicsEditable(false);
		}
		heuristicsSelectable = state;
		if (vHeuristics.length) {
			canvasUpdated = false;
		}
	}
}

function setHeuristicsEditable(state) {
	if (state) {
		setHeuristicsSelectable(true);
	}
	heuristicsEditable = state;
}

function setFlagsVisible(state) {
	if (state != flagsVisible) {
		if (orgNode || dstNode) {
			canvasUpdated = false;
		}
		if (!state) {
			setFlagsEditable(false);
		}
		flagsVisible = state;
	}
}

function setFlagsEditable(state) {
	if (state != flagsEditable) {
		if (state) {
			setFlagsVisible(true);
		}
		flagsEditable = state;
	}
}

function getEdgeId(node1, node2) {
	return node1.id < node2.id ? node1.id + ":" + node2.id : node2.id + ":" + node1.id;
}

function getEdgeBetween(node1, node2) {
	if (node1.id < node2.id) {
		var id = node1.id + ":" + node2.id;
	} else {
		var id = node2.id + ":" + node1.id;
	}
	return edgeIdMap[id];
}

function getHeuristicBetween(node1, node2) {
	if (node1.id < node2.id) {
		var id = node1.id + "~" + node2.id;
	} else {
		var id = node2.id + "~" + node1.id;
	}
	return heuristicIdMap[id];
}

function hideDisplay() {
	hide(".selected-element-display");
}

function showDisplay() {
	show(".selected-element-display");
}

/* Busca o elemento próximo das coordenadas x, y */
function getNearElement(x, y) {
	var shortest = Infinity;
	var element = null;
	var sub;
	sub = nodeRadius + minCurDist;
	if (nodesSelectable) {
		for (var i=0; i<vNodes.length; ++i) {
			var dist = vNodes[i].calcDistanceTo(x, y) - sub;
			if (dist < 0 && dist < shortest) {
				shortest = dist;
				element = vNodes[i];
			}
		}
	}
	function searchEdges() {
		if (edgesSelectable) {
			sub = edgeLineWidth / 2 + minCurDist;
			for (var i=0; i<vEdges.length; ++i) {
				var dist = vEdges[i].calcDistanceTo(x, y) - sub;
				if (dist < 0 && dist < shortest) {
					shortest = dist;
					element = vEdges[i];
				}
			}
		}
	}
	function searchHeuristics() {
		if (heuristicsSelectable) {
			sub = heuristicLineWidth / 2 + minCurDist;
			for (var i=0; i<vHeuristics.length; ++i) {
				var dist = vHeuristics[i].calcDistanceTo(x, y) - sub;
				if (dist < 0 && dist < shortest) {
					shortest = dist;
					element = vHeuristics[i];
				}
			}
		}
	}
	if (selectedElement instanceof Edge) {
		searchHeuristics();
		searchEdges();
	} else {
		searchEdges();
		searchHeuristics();
	}
	return element;
}

function getNearElementForced(x, y) {
	var shortest = Infinity;
	var element = null;
	var sub;
	sub = nodeRadius + minCurDist;
	var aux = nodesSelectable;
	nodesSelectable = true;
	if (nodesSelectable) {
		for (var i=0; i<vNodes.length; ++i) {
			var dist = vNodes[i].calcDistanceTo(x, y) - sub;
			if (dist < 0 && dist < shortest) {
				shortest = dist;
				element = vNodes[i];
			}
		}
	}
	nodesSelectable = aux;
	function searchEdges() {
		if (edgesSelectable) {
			sub = edgeLineWidth / 2 + minCurDist;
			for (var i=0; i<vEdges.length; ++i) {
				var dist = vEdges[i].calcDistanceTo(x, y) - sub;
				if (dist < 0 && dist < shortest) {
					shortest = dist;
					element = vEdges[i];
				}
			}
		}
	}
	function searchHeuristics() {
		if (heuristicsSelectable) {
			sub = heuristicLineWidth / 2 + minCurDist;
			for (var i=0; i<vHeuristics.length; ++i) {
				var dist = vHeuristics[i].calcDistanceTo(x, y) - sub;
				if (dist < 0 && dist < shortest) {
					shortest = dist;
					element = vHeuristics[i];
				}
			}
		}
	}
	if (selectedElement instanceof Edge) {
		searchHeuristics();
		searchEdges();
	} else {
		searchEdges();
		searchHeuristics();
	}
	return element;
}

function setCtrlKeyState(state) {
	var prev = ctrlKeyPressed;
	ctrlKeyPressed = state;
	if (prev !== state) {
		handleCtrlKeyChange();
	}
}

function setShiftKeyState(state) {
	shiftKeyPressed = state;
}

function verifyCanvasSize() {
	var width = window.innerWidth - 250;
	var height = window.innerHeight - 50;
	if (width != canvasSizeX || height != canvasSizeY) {
		canvasSizeX = width;
		canvasSizeY = height;
		canvas.width = canvasSizeX;
		canvas.height = canvasSizeY;
		canvasUpdated = false;
	}
}

function updateCanvas() {
	ctx.clearRect(0, 0, canvasSizeX, canvasSizeY);
	drawEdges(ctx);
	drawHeuristics(ctx);
	drawNodes(ctx);
	drawTitles(ctx);
	if (hoveredElement || selectedElement) {
		drawInfo(ctx);
	}
	if (canvasButtonsVisible) {
		drawButtons(ctx);
	}
}

