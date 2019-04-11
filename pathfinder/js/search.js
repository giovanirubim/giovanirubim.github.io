/*
 * Se x puder ser escrito na forma: y*10^z onde 0 < y < 10 e |z| >= m sendo z um número inteiro
 * então a função resulta numa string com x representado nesta forma onde y possui até m casas
 * decmiais. Caso contrário o retorno é uma string com x arredondado para no máximo m casas
 * decimais. m está definido em MIN_POW.
 */
function sciNot(x) {
	var MIN_POW = 4;
	var MUL_SYMBOL = String.fromCharCode(215);
	if (x == 0) {
		return "0";
	}
	var pow   = 1;
	var value = x;
	while (value < 1) {
		-- pow;
		value = x * Math.pow(10, -pow);
	}
	while (value >= 10) {
		++ pow;
		value = x * Math.pow(10, -pow);
	}
	var roundValue = Math.pow(10, MIN_POW);
	if (Math.abs(pow) >= MIN_POW) {
		var str = (Math.round(value * roundValue) / roundValue).toString();
		str += MUL_SYMBOL + "10^" + pow;
		return str;
	} else {
		return (Math.round(x * roundValue) / roundValue).toString();
	}
}

function onGoingSearch() {
	return searchData != null;
}

function getSearchReport() {
	var report = "";
	if (searchData.found) {
		report += "Search result: found\n";
		report += "Path: {";
		var array = searchData.resultPath;
		for (var i=0; i<array.length; ++i) {
			if (i)
				report += ", ";
			var node = nodeIdMap[array[i]];
			report += node.name || node.id;
		}
		report += "}\n";
		report += "Weight: " + sciNot(searchData.resultWeight) + "\n";
	} else {
		report += "Search result: fail\n";
	}
	report += "Number of iterations: " + searchData.nIterations + "\n";
	report += "Number of nodes queued: " + searchData.nPushes + "\n";
	report += "Queue size: \n";
	report += "\tMaximum: " + searchData.maxQueueLength + "\n";
	var average = searchData.totalQueueLength / searchData.nIterations;
	var array = searchData.historyQueueLength;
	var sum = 0;
	for (var i=0; i<array.length; ++i) {
		var d = array[i] - average;
		sum += d*d;
	}
	var standardDeviation = Math.sqrt(sum / array.length);
	report += "\tAverage: " + sciNot(average) + ", (SD: " + sciNot(standardDeviation) + ")\n";
	return report;
}

function reportSearchError() {
	get("#error_report").value += lastErrorMsg + "\n";
}

function pauseSearchAnimation() {
	if (searchAnimationCode != null) {
		clearInterval(searchAnimationCode);
		searchAnimationCode = null;
		canvasUpdated = false;
	}
}

function playSearchAnimation() {
	if (searchAnimationCode == null) {
		searchAnimationCode = setInterval(function(){
			nextStepSearch();
			update();
		}, 500);
		canvasUpdated = false;
	}
}

function toggleSearchAnimation() {
	if (searchAnimationCode == null) {
		playSearchAnimation();
	} else {
		pauseSearchAnimation();
	}
}

function stopSearch() {
	if (!searchData) {
		return;
	}
	pauseSearchAnimation();
	var onceInQueue = searchData.onceInQueue;
	searchData = null;
	for (var att in onceInQueue) {
		delete nodeIdMap[att].searchInfo;
	}
	canvasUpdated = false;
	setCanvasButtonsVisible(false);
	restoreSelection();
}

function searchSortQueue() {
	if (searchData.method === "Dijkstra") {
		searchData.queue.sort(function(a, b){
			return a.searchInfo.weight - b.searchInfo.weight;
		});
	} else if (searchData.method === "A*") {
		searchData.queue.sort(function(a, b){
			return (a.searchInfo.weight + a.searchInfo.heuristic) - (b.searchInfo.weight
				+ b.searchInfo.heuristic);
		});
	}
}

function searchPushNode(node) {
	if (!searchData.onceInQueue[node.id]) {
		++ searchData.nPushes;
		searchData.onceInQueue[node.id] = true;
		graphUpdated = false;
	}
	searchData.queue.push(node);
	searchData.inQueue[node.id] = true;
	if (searchData.queue.length > searchData.maxQueueLength) {
		searchData.maxQueueLength = searchData.queue.length;
	}
}

function handleSearchEnd() {
	if (!searchData.error) {
		setVal("#search_report", getSearchReport());
	}
	pauseSearchAnimation();
}

function nextStepSearch() {
	if (!searchData) {
		return;
	}
	var queue = searchData.queue;
	var inQueue = searchData.inQueue;
	var onceInQueue = searchData.onceInQueue;
	var edgeSelected = searchData.edgeSelected;
	lastErrorMsg = "";
	if (searchData.state === "start") {
		if (!orgNode) {
			lastErrorMsg = "No origin selected";
			searchData.error = true;
			searchData.isOver = true;
			reportSearchError();
		} else {
			orgNode.searchInfo = {
				weight: 0,
				heuristic: 0,
				prev: null
			};
			searchPushNode(orgNode);
			searchData.state = "pop";
		}
	} else if (searchData.state === "pop") {
		++ searchData.nIterations;
		searchData.totalQueueLength += queue.length;
		searchData.historyQueueLength.push(queue.length);
		if (!queue.length) {
			searchData.state = "failed";
			searchData.found = false;
			searchData.isOver = true;
		} else {
			var node = queue.splice(0, 1)[0];
			searchData.poppedNode = node;
			delete inQueue[node.id];
			if (node === dstNode) {
				edgeSelected = searchData.edgeSelected = {};
				searchData.state = "found";
				searchData.found = true;
				searchData.isOver = true;
				searchData.resultWeight = node.searchInfo.weight;
				var path = [];
				var prev;
				while (node) {
					path.push(node.id);
					prev = node.searchInfo.prev;
					if (prev) {
						edgeSelected[getEdgeId(prev, node)] = true;
					}
					node = prev;
				}
				path.reverse();
				searchData.resultPath = path;
			} else {
				searchData.state = "visitNeighbors";
			}
		}
	} else if (searchData.state === "visitNeighbors") {
		var currentNode = searchData.poppedNode;
		var currentWeight = currentNode.searchInfo.weight;
		var neighbors = currentNode.getReachedNodes();
		var queueUpdated = true;
		var useHeuristic = searchData.method === "A*";
		for (var i=0; i<neighbors.length; ++i) {
			var node = neighbors[i][0];
			var weight = neighbors[i][1] + currentWeight;
			var id = node.id;
			if (!onceInQueue[id]) {
				if (useHeuristic) {
					var heuristic = node === dstNode ? 0 : node.getHeuristicTo(dstNode);
					if (heuristic == null) {
						lastErrorMsg = "Missing heuristic between " + (node.name || node.id)
							+ " and " + (dstNode.name || dstNode.id);
						// searchData.isOver = true;
						// searchData.error = true;
						reportSearchError();
						heuristic = 0;
					}
					node.searchInfo = {
						weight: weight,
						prev: currentNode,
						heuristic: heuristic
					};
				} else {
					node.searchInfo = {
						weight: weight,
						prev: currentNode
					};
				}
				edgeSelected[getEdgeId(currentNode, node)] = true;
				searchPushNode(node);
				queueUpdated = false;
			} else if (inQueue[id]) {
				var info = node.searchInfo;
				if (info.weight > weight) {
					delete edgeSelected[getEdgeId(info.prev, node)];
					edgeSelected[getEdgeId(currentNode, node)] = true;
					info.weight = weight;
					info.prev = currentNode;
					++ searchData.nUpdates;
					queueUpdated = false;
				}
			}
		}
		if (!searchData.isOver) {
			if (!queueUpdated) {
				searchSortQueue();
			}
			searchData.poppedNode = null;
			searchData.state = "pop";
		}
	}
	canvasUpdated = false;
	if (searchData.isOver) {
		handleSearchEnd();
	}
}

function startSearch(method) {
	stopSearch();
	hideSelection();
	setCanvasButtonsVisible(true);
	get("#error_report").value = "";
	searchData = {
		method: method,
		queue: [],
		inQueue: {},
		onceInQueue: {},
		poppedNode: null,
		state: "start",
		nIterations: 0,
		maxQueueLength: 0,
		totalQueueLength: 0,
		historyQueueLength: [],
		nPushes: 0,
		nUpdates: 0,
		edgeSelected: {},
		found: null,
		isOver: false,
		error: false
	};
}

function getNearCanvasButton(x, y) {
	if (!canvasButtonsVisible) {
		return null;
	}
	var buttonX;
	var buttonY = canvasButtonsMarginTop + canvasButtonRadius;
	var dx = canvasButtonsMarginLeft + canvasButtonRadius * 2;
	for (var i=0; i<nCanvasButtons; ++i) {
		buttonX = canvasButtonsMarginLeft + canvasButtonRadius + dx * i;
		if (getDistance(buttonX, buttonY, x, y) <= canvasButtonRadius) {
			return i;
		}
	}
	return null;
}
