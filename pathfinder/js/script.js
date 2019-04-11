function getDistance(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	return Math.sqrt(dx*dx + dy*dy);
}

function getDistanceToSegment(x, y, x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var a = Math.sqrt(dx*dx + dy*dy);
	var b = getDistance(x1, y1, x, y);
	var c = getDistance(x2, y2, x, y);
	var asqr = a*a;
	var bsqr = b*b;
	var csqr = c*c;
	var hB = bsqr - asqr - csqr;
	var hC = csqr - asqr - bsqr;
	if (hB >= 0) {
		return b;
	}
	if (hC >= 0) {
		return c;
	}
	return Math.abs(x*dy - y*dx + x2*y1 - y2*x1) / a;
}

function removeFromArray(array, element) {
	var index = array.indexOf(element);
	if (index >= 0) {
		array.splice(index, 1);
	}
	return array;
}

function update() {
	if (!canvasUpdated || !graphUpdated || !selectionUpdated || !hoverUpdated) {
		updateCanvas();
	}
	if (!graphUpdated) {
		pushCurrentState();
		saveState();
	} else if (selectionUpdated && !caughtUpNode) {
		updateCurrentState();
	}
	canvasUpdated = true;
	graphUpdated = true;
	selectionUpdated = true;
	hoverUpdated = true;
}

function connectToAll(targetNode) {
	if (edgesEditable) {
		for (var i=0; i<vNodes.length; ++i) {
			var node = vNodes[i];
			if (node !== targetNode && !node.isConnectedTo(targetNode)) {
				node.connectTo(targetNode);
			}
		}
	} else if (heuristicsEditable) {
		for (var i=0; i<vNodes.length; ++i) {
			var node = vNodes[i];
			if (node !== targetNode && !node.hasHeuristicTo(targetNode)) {
				node.setHeuristicTo(targetNode);
			}
		}
	}
}

function reportScriptError(lineNumber) {
	alert("Error at line " + lineNumber + "\n" + lastErrorMsg);
}

function readScript(text) {
	lastErrorMsg = "";
	var nodeNameMap = {};
	clearGraph();
	var lines = text.split("\n");
	var i;
	function error() {
		reportScriptError(i + 1);
		clearGraph();
		return false;
	}
	function filterArgs(args) {
		var arg;
		for (var i=0; i<args.length; ++i) {
			arg = args[i].trim();
			if (!arg)
				return false;
			args[i] = arg;
		}
		return true;
	}
	function getNode(name) {
		var node = nodeNameMap[name];
		if (!node) {
			node = new Node(0, 0);
			node.name = name;
			nodeNameMap[name] = node;
		}
		return node;
	}
	var cmd = {
		inicial: function(array) {
			if (array.length != 1) {
				lastErrorMsg = "Function inicial requires one argument";
				return false;
			}
			orgNode = getNode(array[0]);
			return true;
		}, final: function(array) {
			if (array.length != 1) {
				lastErrorMsg = "Function final requires one argument";
				return false;
			}
			dstNode = getNode(array[0]);
			return true;
		}, caminho: function(array) {
			if (array.length != 3) {
				lastErrorMsg = "Function caminho requires three arguments";
				return false;
			}
			var w = parseFloat(array[2]);
			if (isNaN(w)) {
				lastErrorMsg = "Invalid weight";
				return false;
			}
			var a = getNode(array[0]);
			var b = getNode(array[1]);
			if (a !== b)
				new Edge(a, b, false, w);
			return true;
		}, h: function(array) {
			if (array.length != 3) {
				lastErrorMsg = "Function h requires three arguments";
				return false;
			}
			var w = parseFloat(array[2]);
			if (isNaN(w)) {
				lastErrorMsg = "Invalid weight";
				return false;
			}
			var a = getNode(array[0]);
			var b = getNode(array[1]);
			if (a !== b)
				new Heuristic(a, b, false, w);
			return true;
		}
	};
	for (i=0; i<lines.length; ++i) {
		var line = lines[i].trim();
		var temp = line;
		if (!line) {
			continue;
		}
		var index = line.indexOf("(");
		if (index < 0) {
			lastErrorMsg = "Missing \"(\"";
			return error();
		}
		line = line.split("(");
		var cmdName = line[0].trim();
		if (!cmdName) {
			lastErrorMsg = "Missing function name before \"(\"";
			return error();
		}
		line = line[1].split(")");
		if (line.length == 1) {
			lastErrorMsg = "Missing \")\"";
			return error();
		}
		var args = line[0].trim();
		if (!args) {
			args = [];
		} else {
			args = args.split(",");
			if (!filterArgs(args)) {
				lastErrorMsg = "Incorret arguments syntax ";
				return error();
			}
		}
		var f = cmd[cmdName];
		if (!f) {
			lastErrorMsg = "Unknown function \"" + cmdName + "\"";
			return error();
		}
		if (!f(args)) {
			return error();
		}
	}
	shuffleGraph();
}
