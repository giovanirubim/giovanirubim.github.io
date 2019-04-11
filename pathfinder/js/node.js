function Node(x, y) {
	if ((typeof x) === "string" && y == null) {
		var array = x.split("/");
		this.x = parseInt(array[2]);
		this.y = parseInt(array[3]);
		var id = parseInt(array[0]);
		var name = array[1];
	} else {
		this.x = x;
		this.y = y;
		var id = ++lastNodeId;
		var name = "";
	}
	this.id = id;
	this.name = name;
	nodeIdMap[id] = this;
	this.connectsTo_map = {};
	this.onGEdges = [];
	this.onCEdges = [];
	vNodes.push(this);
	graphUpdated = false;
}

Node.prototype.calcDistanceTo = function(x, y) {
	var dx = this.x - x;
	var dy = this.y - y;
	return Math.sqrt(dx*dx + dy*dy);
};

Node.prototype.isConnectedTo = function(node, directed) {
	var edge = this.connectsTo_map[node.id];
	if (!edge) {
		return false;
	}
	if (!edge.directed || !directed) {
		return true;
	}
	return edge.org == this || edge.goesBackward;
};

Node.prototype.connectTo = function(node, directed) {
	new Edge(this, node, directed);
	return this;
};

Node.prototype.getReachedNodes = function() {
	var result = [];
	var edges = this.onGEdges;
	for (var i=0; i<edges.length; ++i) {
		var edge = edges[i];
		if (edge.org === this) {
			if (edge.value == null) {
				result.push([edge.dst, this.calcDistanceTo(edge.dst.x, edge.dst.y)]);
			} else {
				result.push([edge.dst, edge.value]);
			}
		} else {
			var value = edge.directed ? edge.backwardValue : edge.value;
			if (value == null) {
				result.push([edge.org, this.calcDistanceTo(edge.org.x, edge.org.y)]);
			} else {
				result.push([edge.org, value]);
			}
		}
	}
	return result;
};

Node.prototype.disconnectFrom = function(node) {
	if (this.id < node.id) {
		var edgeId = this.id + ":" + node.id;
	} else {
		var edgeId = node.id + ":" + this.id;
	}
	var edge = edgeIdMap[edgeId];
	if (edge) {
		edge.remove();
	}
	return this;
};

Node.prototype.setHeuristicTo = function(node, directed, value) {
	new Heuristic(this, node, directed, value);
	return this;
};

Node.prototype.hasHeuristicTo = function(node, directed) {
	var heuristic = getHeuristicBetween(this, node);
	if (!heuristic)
		return false;
	return !directed || !heuristic.directed || heuristic.org == this;
};

Node.prototype.getHeuristicTo = function(node) {
	var heuristic = getHeuristicBetween(this, node);
	if (!heuristic)
		return null;
	if (heuristic.directed) {
		if (heuristic.org == this) {
			return heuristic.value;
		}
		return heuristic.backwardValue;
	}
	if (heuristic.value != null) {
		return heuristic.value;
	}
	var a = heuristic.org;
	var b = heuristic.dst;
	return getDistance(a.x, a.y, b.x, b.y);
};

Node.prototype.removeHeuristicTo = function(node) {
	if (this.id < node.id) {
		var id = this.id + "~" + node.id;
	} else {
		var id = node.id + "~" + this.id;
	}
	var heuristic = heuristicIdMap[id];
	if (heuristic) {
		heuristic.remove();
	}
	return this;
};

Node.prototype.toString = function(){
	return this.id + "/" + (this.name || "") + "/" + this.x + "/" + this.y; 
};

Node.prototype.remove = function(){
	while (this.onGEdges.length) {
		this.onGEdges[0].remove();
	}
	while (this.onCEdges.length) {
		this.onCEdges[0].remove();
	}
	delete nodeIdMap[this.id];
	removeFromArray(vNodes, this);
	graphUpdated = false;
	var array = heuristicsTo[this.id];
	if (array) {
		while (array.length) {
			array[0].remove();
		}
	}
	if (this === selectedElement) {
		hideDisplay();
		setAsSelected(null);
	}
	if (this === orgNode) {
		setAsOrgNode(null);
	}
	if (this === dstNode) {
		setAsDstNode(null);
	}
	return this;
};
