function clearGraph() {
	if (!vNodes.length) {
		return;
	}
	setAsSelected(null, true);
	setAsHovered(null);
	setAsOrgNode(null);
	setAsDstNode(null);
	vNodes = [];
	vEdges = [];
	vHeuristics = [];
	nodeIdMap = {};
	edgeIdMap = {};
	heuristicIdMap = {};
	caughtUpNode = null;
	canvasUpdated = false;
	lastNodeId = 0;
}

function centerGraph() {
	if (!vNodes.length) {
		return;
	}
	var x0 = Infinity;
	var x1 = -Infinity;
	var y0 = Infinity;
	var y1 = -Infinity;
	for (var i=0; i<vNodes.length; ++i) {
		var node = vNodes[i];
		x0 = Math.min(x0, node.x);
		x1 = Math.max(x1, node.x);
		y0 = Math.min(y0, node.y);
		y1 = Math.max(y1, node.y);
	}
	var cx = x0 + (x1 - x0)*0.5;
	var cy = y0 + (y1 - y0)*0.5;
	for (var i=0; i<vNodes.length; ++i) {
		var node = vNodes[i];
		node.x += canvasSizeX*0.5 - cx;
		node.y += canvasSizeY*0.5 - cy;
	}
	graphUpdated = false;
}

function shuffleGraph() {
	if (!vNodes.length) {
		return;
	}
	var cx = canvasSizeX*0.5;
	var cy = canvasSizeY*0.5;
	var radius = Math.min(canvasSizeX, canvasSizeY) * 0.5;
	for (var i=0; i<vNodes.length; ++i) {
		var node = vNodes[i];
		node.x = cx + (Math.random() - 0.5) * radius;
		node.y = cy + (Math.random() - 0.5) * radius;
	}
	graphUpdated = false;
}

var mulLen = 1;
function applyForceAt(edge) {
	var a = edge.org;
	var b = edge.dst;
	var dx = b.x - a.x;
	var dy = b.y - a.y;
	var len = Math.sqrt(dx*dx + dy*dy);
	var val = Math.abs(edge.value)*mulLen;
	var dif = len - val;
	var fx = dx/len*dif;
	var fy = dy/len*dif;
	a.fx += fx;
	a.fy += fy;
	b.fx -= fx;
	b.fy -= fy;
}

function applyForce() {
	for (var i=0; i<vNodes.length; ++i) {
		var node = vNodes[i];
		node.fx = 0;
		node.fy = 0;
	}
	for (var i=0; i<vEdges.length; ++i) {
		applyForceAt(vEdges[i]);
	}
	for (var i=0; i<vHeuristics.length; ++i) {
		applyForceAt(vHeuristics[i]);
	}
	function f(x) {
		var sign = x < 0 ? -1 : 1;
		return Math.abs(Math.pow(Math.abs(x), 0.75))*sign*0.05;
	}
	for (var i=0; i<vNodes.length; ++i) {
		var node = vNodes[i];
		if (node === caughtUpNode) {
			continue;
		}
		node.x += f(node.fx);
		node.y += f(node.fy);
	}
	graphUpdated = false;
}
