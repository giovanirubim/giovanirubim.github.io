function Edge(node1, node2, directed, value) {
	var goesBackward = false;
	var backwardValue = null;
	directed = directed || false;
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
	directed = directed || false;
	if (node1.id < node2.id) {
		var smlIdNode = node1;
		var bigIdNode = node2;
	} else {
		var smlIdNode = node2;
		var bigIdNode = node1;
	}
	if (directed) {
		this.org = node1;
		this.dst = node2;
	} else {
		this.org = smlIdNode;
		this.dst = bigIdNode;
		this.org.onCEdges.push(this);
		this.dst.onGEdges.push(this);
		this.dst.connectsTo_map[this.org.id] = this;
	}
	this.org.onGEdges.push(this);
	this.dst.onCEdges.push(this);
	this.org.connectsTo_map[this.dst.id] = this;
	this.directed = directed;
	var id = smlIdNode.id + ":" + bigIdNode.id;
	this.id = id;
	edgeIdMap[id] = this;
	vEdges.push(this);
	graphUpdated = false;
	this.goesBackward = goesBackward;
	this.backwardValue = backwardValue;
	this.value = value;
}

Edge.prototype.setBackward = function(state) {
	state = state || false;
	if (this.goesBackward != state) {
		graphUpdated = false;
	}
	this.goesBackward = state;
	this.backwardValue = null;
	return this;
};

/* Cacula a distância entre a aresta e as coordenadas x, y */
Edge.prototype.calcDistanceTo = function(x, y) {
	return getDistanceToSegment(x, y, this.org.x, this.org.y, this.dst.x, this.dst.y);
};

Edge.prototype.toString = function(){
	var value = this.value == null ? "" : this.value;
	var backwardValue = this.goesBackward ? this.backwardValue : "";
	return this.org.id + "/" + this.dst.id + "/" + this.directed * 1 + "/" + value + "/"
		+ backwardValue;
};

/* Remove uma aresta e todas suas referências */
Edge.prototype.remove = function(){
	var index;
	removeFromArray(this.org.onGEdges, this);
	removeFromArray(this.dst.onCEdges, this);
	delete this.org.connectsTo_map[this.dst.id];
	if (!this.directed) {
		removeFromArray(this.org.onCEdges, this);
		removeFromArray(this.dst.onGEdges, this);
		delete this.dst.connectsTo_map[this.org.id];
	}
	delete edgeIdMap[this.id];
	removeFromArray(vEdges, this);
	if (this === selectedElement) {
		hideDisplay();
		setAsSelected(null);
	}
	graphUpdated = false;
	return this;
};
