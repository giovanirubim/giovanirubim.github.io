var transform = [
	0.9995065603657316, -0.03141075907812829, 100,
	0.03141075907812829, 0.9995065603657316, 100,
];

function getScale() {
	// var a = transform[0];
	// var b = transform[3];
	// return Math.sqrt(a*a + b*b);
	return 1;
}

function getCoord(dst, src) {
	dst.x = src.x;
	dst.y = src.y;
	// var m = transform;
	// var x = src.x*m[0] + src.y*m[1] + m[2];
	// var y = src.x*m[3] + src.y*m[4] + m[5];
	// dst.x = x;
	// dst.y = y;
	// return dst;
}

function invCoord(dst, src) {
	dst.x = src.x;
	dst.y = src.y;
	// var m = transform;
	// var a = m[0];
	// var b = m[1];
	// var c = m[2];
	// var d = m[3];
	// var e = m[4];
	// var f = m[5];
	// var rx = src.x;
	// var ry = src.y;
	// var x, y;
	// x = (rx - (ry - f)*b/e - c)/(a - d*b/e);
	// y = (ry - d*x - f)/e;
	// dst.x = x;
	// dst.y = y;
}

function createArrowhead(ctx, ax, ay, bx, by, backwards) {
	var dx = bx - ax;
	var dy = by - ay;
	var dist = Math.sqrt(dx*dx + dy*dy);
	var vx = dx / dist;
	var vy = dy / dist;
	var endx = bx - vx * nodeRadius;
	var endy = by - vy * nodeRadius;
	var rad = dy < 0 ? Math.PI * 2 - Math.acos(vx) : Math.acos(vx);
	var angle1 = Math.PI + rad + arrowHeadAngle;
	var angle2 = Math.PI + rad - arrowHeadAngle;
	var x, y;
	var dx1 = Math.cos(angle1) * arrowHeadSize;
	var dy1 = Math.sin(angle1) * arrowHeadSize;
	x = endx + dx1;
	y = endy + dy1;
	ctx.moveTo(x, y);
	ctx.lineTo(endx, endy);
	dx2 = Math.cos(angle2) * arrowHeadSize;
	dy2 = Math.sin(angle2) * arrowHeadSize;
	x = endx + dx2;
	y = endy + dy2;
	ctx.lineTo(x, y);
	if (backwards) {
		endx = ax + vx * nodeRadius;
		endy = ay + vy * nodeRadius;
		ctx.moveTo(endx - dx1, endy - dy1);
		ctx.lineTo(endx, endy);
		ctx.lineTo(endx - dx2, endy - dy2);
	}
}

function createFlag(ctx, x, y, size) {
	var r = size / 3;
	var h = r * 2;
	var cx = x;
	var cy = y - h;
	var a = Math.sqrt(h*h - r*r);
	var angle = Math.asin(a / h);
	var px = x + a * Math.cos(Math.PI + angle);
	var py = y + a * Math.sin(Math.PI + angle);
	var dx = x - px;
	angle = Math.acos(dx / r);
	ctx.arc(cx, cy, r, Math.PI - angle, Math.PI*2 + angle);
	ctx.moveTo(px, py);
	ctx.lineTo(x, y);
	ctx.lineTo(x + (x - px), py);
}

function drawTitles() {
	ctx.textBaseline = "bottom";
	ctx.textAlign = "center";
	ctx.fillStyle = "#fff";
	ctx.font = "18px monospace";
	var pos = {x: 0, y: 0};
	for (var i=0; i<vNodes.length; ++i) {
		var node = vNodes[i];
		getCoord(pos, node);
		ctx.fillText(node.name || node.id, pos.x, pos.y - 10);
	}
}

function drawNodes(ctx) {
	ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
	var borderWidth = nodeRadius/4;
	var borderRadius = nodeRadius - borderWidth / 2;
	ctx.lineWidth = borderWidth;
	if (searchData) {
		var poppedNode = searchData.poppedNode;
		var onceInQueue = searchData.onceInQueue;
		var inQueue = searchData.inQueue;
	}
	var pos = {x: 0, y: 0};
	for (var i=0; i<vNodes.length; ++i) {
		var node = vNodes[i];
		if (searchData) {
			if (node === searchData.poppedNode) {
				ctx.fillStyle = poppedNodeColor;
			} else if (inQueue[node.id]) {
				ctx.fillStyle = nodeInQueueColor;
			} else if (node.searchInfo) {
				ctx.fillStyle = nodeOnceInQueueColor;
			} else {
				ctx.fillStyle = nodeColor;
			}
		} else if (nodesSelectable) {
			if (node === hoveredElement) {
				if (node === selectedElement) {
					ctx.fillStyle = hoveredSelectedNodeColor;
				} else {
					ctx.fillStyle = hoveredNodeColor;
				}
			} else if (node === selectedElement) {
				ctx.fillStyle = selectedNodeColor;
			} else {
				ctx.fillStyle = nodeColor;
			}
		} else {
			ctx.fillStyle = nodeColor;
		}
		getCoord(pos, node);
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, borderRadius, 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.fillStyle = ctx.strokeStyle;
		ctx.arc(pos.x, pos.y, nodeRadius * 0.2, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();
	}
	if (flagsVisible) {
		if (orgNode && orgNode === dstNode) {
			ctx.fillStyle = orgDstNodeFlagColor;
			ctx.strokeStyle = orgDstNodeFlagBorderColor;
			ctx.lineWidth = flagBorderWidth;
			ctx.beginPath();
			getCoord(pos, orgNode);
			createFlag(ctx, pos.x, pos.y - nodeRadius, flagSize);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		} else {
			if (orgNode) {
				ctx.fillStyle = orgNodeFlagColor;
				ctx.strokeStyle = orgNodeFlagBorderColor;
				ctx.lineWidth = flagBorderWidth;
				ctx.beginPath();
				getCoord(pos, orgNode);
				createFlag(ctx, pos.x, pos.y - nodeRadius, flagSize);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
			}
			if (dstNode) {
				ctx.fillStyle = dstNodeFlagColor;
				ctx.strokeStyle = dstNodeFlagBorderColor;
				ctx.lineWidth = flagBorderWidth;
				ctx.beginPath();
				getCoord(pos, dstNode);
				createFlag(ctx, pos.x, pos.y - nodeRadius, flagSize);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
			}
		}
	}
}

function drawEdges(ctx) {
	ctx.lineCap = "round";
	ctx.lineWidth = edgeLineWidth;
	if (!edgesSelectable) {
		ctx.strokeStyle = lockedEdgeColor;
	}
	if (searchData) {
		var edgeSelected = searchData.edgeSelected;
	}
	var a = {x: 0, y: 0};
	var b = {x: 0, y: 0};
	for (var i=0; i<vEdges.length; ++i) {
		var edge = vEdges[i];
		var org = edge.org;
		var dst = edge.dst;
		if (searchData) {
			if (edgeSelected[edge.id]) {
				ctx.strokeStyle = selectedPathEdgeColor;
			} else {
				ctx.strokeStyle = edgeColor;
			}
		} else if (edgesSelectable) {
			if (edge === hoveredElement) {
				if (edge === selectedElement) {
					ctx.strokeStyle = hoveredSelectedEdgeColor;
				} else {
					ctx.strokeStyle = hoveredEdgeColor;
				}
			} else if (edge === selectedElement) {
				ctx.strokeStyle = selectedEdgeColor;
			} else {
				ctx.strokeStyle = edgeColor;
			}
		}
		ctx.beginPath();
		getCoord(a, edge.org);
		getCoord(b, edge.dst);
		ctx.moveTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
		if (edge.directed) {
			createArrowhead(ctx, a.x, a.y, b.x, b.y, edge.goesBackward);
		}
		ctx.stroke();
		ctx.closePath();
	}
}

function drawHeuristics() {
	ctx.lineWidth = heuristicLineWidth;
	var dash = [4, 10];
	var normal = [1];
	ctx.setLineDash(dash);
	if (!heuristicsSelectable) {
		ctx.strokeStyle = lockedHeuristicColor;
	}
	var a = {x: 0, y: 0};
	var b = {x: 0, y: 0};
	for (var i=0; i<vHeuristics.length; ++i) {
		var heuristic = vHeuristics[i];
		if (heuristicsSelectable) {
			if (heuristic === selectedElement) {
				if (heuristic === hoveredElement) {
					ctx.strokeStyle = hoveredSelectedHeuristicColor;
				} else {
					ctx.strokeStyle = selectedHeuristicColor;
				}
			} else if (heuristic === hoveredElement) {
				ctx.strokeStyle = hoveredHeuristicColor;
			} else {
				ctx.strokeStyle = heuristicColor;
			}
		}
		getCoord(a, heuristic.org);
		getCoord(b, heuristic.dst);
		ctx.beginPath();
		ctx.moveTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
		if (heuristic.directed) {
			ctx.stroke();
			ctx.closePath();
			ctx.setLineDash(normal);
			ctx.beginPath();
			createArrowhead(ctx, a.x, a.y, b.x, b.y, heuristic.goesBackward);
			ctx.stroke();
			ctx.closePath();
			ctx.setLineDash(dash);
		} else {
			ctx.stroke();
			ctx.closePath();
		}
	}
	ctx.setLineDash(normal);
}

function drawButtons(ctx) {
	var x;
	var y = canvasButtonsMarginTop + canvasButtonRadius;
	var dx = canvasButtonsMarginLeft + canvasButtonRadius * 2;
	ctx.lineWidth = 5;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	var a = canvasButtonRadius / 5;
	var b = canvasButtonRadius / 4;
	var c = canvasButtonRadius / 3;
	for (var i=0; i<nCanvasButtons; ++i) {
		x = canvasButtonsMarginLeft + canvasButtonRadius + dx * i;
		if (i == hoveredCanvasButton) {
			ctx.fillStyle = hoveredCanvasButtonColor;
		} else {
			ctx.fillStyle = canvasButtonColor;
		}
		ctx.beginPath();
		ctx.arc(x, y, canvasButtonRadius, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();
		ctx.strokeStyle = "#fff";
		ctx.fillStyle = "#fff";
		switch (i) {
			case 0: {
				ctx.beginPath();
				ctx.moveTo(x + b, y + b);
				ctx.lineTo(x - b, y - b);
				ctx.moveTo(x - b, y + b);
				ctx.lineTo(x + b, y - b);
				ctx.stroke();
				ctx.closePath();
			} break;
			case 1: {
				ctx.beginPath();
				if (searchAnimationCode == null) {
					ctx.moveTo(x - a, y - b);
					ctx.lineTo(x - a, y + b);
					ctx.lineTo(x + c, y);
					ctx.lineTo(x - a, y - b);
					ctx.fill();
				} else {
					ctx.moveTo(x - a, y - b);
					ctx.lineTo(x - a, y + b);
					ctx.moveTo(x + a, y - b);
					ctx.lineTo(x + a, y + b);
				}
				ctx.stroke();
				ctx.closePath();
			} break;
			case 2: {
				ctx.beginPath();
				ctx.moveTo(x - b, y);
				ctx.lineTo(x + b, y);
				ctx.moveTo(x + b - a, y - a);
				ctx.lineTo(x + b, y);
				ctx.lineTo(x + b - a, y + a);
				ctx.stroke();
				ctx.fill();
				ctx.closePath();
			} break;
			case 3: {
				ctx.beginPath();
				ctx.moveTo(x + a, y - a);
				ctx.lineTo(x + a*2, y);
				ctx.lineTo(x + a, y + a);
				ctx.moveTo(x - a*1.5, y - a);
				ctx.lineTo(x - a*0.5, y);
				ctx.lineTo(x - a*1.5, y + a);
				ctx.stroke();
				ctx.fill();
				ctx.closePath();
			} break;
		}
	}
}

function drawInfo(ctx) {
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.font = "16px monospace";
	ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
	var info = "";
	if (onGoingSearch()) {
		var element = hoveredElement;
	} else {
		var element = hoveredElement || selectedElement;
	}
	if (element instanceof Node) {
		info = "Node: " + (element.name || element.id);
		if (element === orgNode && element !== dstNode) {
			info += " (origin)";
		} else if (element === dstNode && element !== orgNode) {
			info += " (target)";
		} else if (element === orgNode && element === dstNode) {
			info += " (origin/target)";
		}
	} if ((element instanceof Edge) || (element instanceof Heuristic)) {
		info = (element instanceof Edge) ? "Edge " : "Heuristic ";
		var a = (element.org.name || element.org.id);
		var b = (element.dst.name || element.dst.id);
		info += "from " + a + " to " + b;
		if (!element.directed) {
			info += " and " + b + " to " + a + ", ";
			var weight = element.value;
			if (weight == null) {
				weight = getDistance(element.org.x, element.org.y,
					element.dst.x, element.dst.y);
				weight = Math.round(weight * 100) / 100;
			}
			info += "weight: " + weight;
		} else {
			var weight = element.value;
			var distance = null;
			if (weight == null) {
				distance = getDistance(element.org.x, element.org.y,
					element.dst.x, element.dst.y);
				distance = Math.round(distance * 100) / 100;
				weight = distance;
			}
			info += ", weight: " + weight;
			if (element.goesBackward) {
				info += "; from " + b + " to " + a + ", weight: ";
				weight = element.backwardValue;
				if (weight == null) {
					if (distance != null) {
						weight = distance;
					} else {
						weight = getDistance(element.org.x, element.org.y,
							element.dst.x, element.dst.y);
						weight = Math.round(weight * 100) / 100;
					}
				}
				info += weight;
			}
		}
	}
	ctx.fillText(info, 10, canvasSizeY - 10);
}
