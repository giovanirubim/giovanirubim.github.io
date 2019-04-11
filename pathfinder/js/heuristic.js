function Heuristic(node1, node2, directed, value) {
	directed = directed || false;
	var goesBackward = false;
	var backwardValue = null;
	if ((typeof node1) === "string" && node2 == null) {
		var array = node1.split("/");
		node1 = nodeIdMap[array[0]];
		node2 = nodeIdMap[array[1]];
		directed = array[2] === "1";
		if (array[3] !== "") {
			value = parseFloat(array[3]);
		}
		if (array[4] !== "") {
			goesBackward = true;
			backwardValue = parseFloat(array[4]);
		}
	}
	if (node1.id < node2.id) {
		var smlIdNode = node1;
		var bigIdNode = node2;
	} else {
		var smlIdNode = node2;
		var bigIdNode = node1;
	}
	this.directed = directed;
	if (directed) {
		this.org = node1;
		this.dst = node2;
	} else {
		this.org = smlIdNode;
		this.dst = bigIdNode;
	}
	(heuristicsTo[node1.id]||(heuristicsTo[node1.id]=[])).push(this);
	(heuristicsTo[node2.id]||(heuristicsTo[node2.id]=[])).push(this);
	var id = smlIdNode.id + "~" + bigIdNode.id;
	this.id = id;
	heuristicIdMap[id] = this;
	vHeuristics.push(this);
	graphUpdated = false;
	this.value = value;
	this.goesBackward = goesBackward;
	this.backwardValue = backwardValue;
}

Heuristic.prototype.setBackward = function(state) {
	state = state || false;
	if (state != this.goesBackward) {
		graphUpdated = false;
	}
	this.goesBackward = state;
	this.backwardValue = null;
	return this;
};

Heuristic.prototype.calcDistanceTo = function(x, y) {
	return getDistanceToSegment(x, y, this.org.x, this.org.y, this.dst.x, this.dst.y);
};

Heuristic.prototype.toString = function(){
	var value = this.value == null ? "" : this.value;
	var backwardValue = this.goesBackward ? this.backwardValue : "";
	return this.org.id + "/" + this.dst.id + "/" + this.directed * 1 + "/" + value + "/"
		+ backwardValue;
};

Heuristic.prototype.remove = function(){
	delete heuristicIdMap[this.id];
	removeFromArray(vHeuristics, this);
	var ids = [this.org.id, this.dst.id];
	for (var i=0; i<ids.length; ++i) {
		var id = ids[i];
		var array = heuristicsTo[id];
		removeFromArray(array, this);
		if (!array.length) {
			delete heuristicsTo[id];
		}
	}
	if (this === selectedElement) {
		setAsSelected(null);
		hideDisplay();
	}
	graphUpdated = false;
	return this;
};
