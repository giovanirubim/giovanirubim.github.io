function loadState() {
	if (localStorage) {
		var str = localStorage.getItem("graph-state");
		if (str) {
			stateHistory = [str];
			stateHistoryIndex = 0;
			restoreState(str);
		}
	}
}

function saveState() {
	if (localStorage) {
		localStorage.setItem("graph-state", stateHistory[stateHistoryIndex]);
	}
}

function getCurrentState() {
	var result = "";
	for (var i=0; i<vNodes.length; ++i) {
		if (i)
			result += ";";
		result += vNodes[i].toString();
	}
	result += "|";
	for (var i=0; i<vEdges.length; ++i) {
		if (i)
			result += ";";
		result += vEdges[i].toString();
	}
	result += "|";
	for (var i=0; i<vHeuristics.length; ++i) {
		if (i)
			result += ";";
		result += vHeuristics[i].toString();
	}
	result += "|" + lastNodeId;
	result += "|" + (selectedElement ? selectedElement.id : "");
	result += "|" + (orgNode ? orgNode.id : "");
	result += "|" + (dstNode ? dstNode.id : "");
	return result;
}

function restoreState(state) {
	clearGraph();
	state = state.split("|");
	var nodes = state[0] && state[0].split(";") || [];
	var edges = state[1] && state[1].split(";") || [];
	var heuristics = state[2] && state[2].split(";") || [];
	for (var i=0; i<nodes.length; ++i) {
		new Node(nodes[i]);
	}
	for (var i=0; i<edges.length; ++i) {
		new Edge(edges[i]);
	}
	for (var i=0; i<heuristics.length; ++i) {
		new Heuristic(heuristics[i]);
	}
	lastNodeId = parseInt(state[3]);
	var id = state[4];
	setAsSelected(nodeIdMap[id] || edgeIdMap[id] || heuristicIdMap[id]);
	setAsOrgNode(nodeIdMap[state[5]]);
	setAsDstNode(nodeIdMap[state[6]]);
}

function updateCurrentState() {
	stateHistory[stateHistoryIndex] = getCurrentState();
}

function pushCurrentState() {
	var remaining = stateHistory.length - stateHistoryIndex - 1;
	var state = getCurrentState();
	if (remaining > 0) {
		stateHistory.splice(stateHistoryIndex + 1, remaining);
	}
	stateHistory.push(state);
	stateHistoryIndex = stateHistory.length - 1;
	if (stateHistory.length > stateHistoryMaxLength) {
		stateHistory.splice(0, 1);
		stateHistoryIndex = stateHistory.length - 1;
	}
}

function undo() {
	if (stateHistoryIndex) {
		-- stateHistoryIndex;
		restoreState(stateHistory[stateHistoryIndex]);
		graphUpdated = true;
		canvasUpdated = false;
	}
}

function redo() {
	if (stateHistoryIndex < stateHistory.length - 1) {
		++ stateHistoryIndex;
		restoreState(stateHistory[stateHistoryIndex]);
		graphUpdated = true;
		canvasUpdated = false;
	}
}
