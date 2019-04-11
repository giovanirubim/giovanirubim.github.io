function handleNodeSelectionChange() {
	if (selectedElement == null) {
		addClass("#connect_all", "disabled");
		addClass("#set_org", "disabled");
		addClass("#set_dst", "disabled");
	} else {
		removeClass("#connect_all", "disabled");
		if (selectedElement == orgNode) {
			addClass("#set_org", "disabled");
		} else {
			removeClass("#set_org", "disabled");
		}
		if (selectedElement == dstNode) {
			addClass("#set_dst", "disabled");
		} else {
			removeClass("#set_dst", "disabled");
		}
	}
}

function handleCtrlKeyChange() {}

function handleDoubleClick() {}

function handleEdgeChange(org, dst, directed) {
	if (!edgesEditable) {
		return;
	}
	var edge = getEdgeBetween(org, dst);
	if (!edge) {
		org.connectTo(dst, directed);
		return true;
	} else {
		if (directed) {
			if (edge.directed) {
				if (org == edge.org) {
					if (edge.goesBackward) {
						var value = edge.backwardValue;
						edge.remove();
						dst.connectTo(org, true);
						var newEdge = getEdgeBetween(org, dst);
						newEdge.value = value;
						return true;
					} else {
						edge.remove();
						return true;
					}
				} else {
					if (edge.goesBackward) {
						edge.setBackward(false);
						return true;
					} else {
						edge.setBackward(true);
						return true;
					}
				}
			} else {
				edge.remove();
				org.connectTo(dst, true);
				return true;
			}
		} else {
			if (edge.directed) {
				edge.remove();
				org.connectTo(dst);
				return true;
			} else {
				edge.remove();
				return true;
			}
		}
	}
	return false;
}

function handleHeuristicChange(org, dst, directed) {
	var heuristic = getHeuristicBetween(org, dst);
	if (!heuristicsEditable) {
		return;
	}
	if (!heuristic) {
		org.setHeuristicTo(dst, directed);
		return true;
	} else {
		if (directed) {
			if (heuristic.directed) {
				if (org == heuristic.org) {
					if (heuristic.goesBackward) {
						var value = heuristic.backwardValue;
						heuristic.remove();
						dst.setHeuristicTo(org, true);
						var newHeuristic = getHeuristicBetween(org, dst);
						newHeuristic.value = value;
						return true;
					} else {
						heuristic.remove();
						return true;
					}
				} else {
					if (heuristic.goesBackward) {
						heuristic.setBackward(false);
						return true;
					} else {
						heuristic.setBackward(true);
						return true;
					}
				}
			} else {
				heuristic.remove();
				org.setHeuristicTo(dst, true);
				return true;
			}
		} else {
			if (heuristic.directed) {
				heuristic.remove();
				org.setHeuristicTo(dst);
				return true;
			} else {
				heuristic.remove();
				return true;
			}
		}
	}
	return false;
}

function handleCanvasButtonClick(index) {
	switch (index) {
		case 0: {
			stopSearch();
		} break;
		case 1: {
			toggleSearchAnimation();
		} break;
		case 2: {
			nextStepSearch();
		} break;
		case 3: {
			while (!searchData.isOver) {
				nextStepSearch();
			}
		} break;
	}
}

function handleLeftClick(x, y, rx, ry) {
	if (preventClick) {
		preventClick = false;
		return;
	}
	var near = getNearElement(x, y);
	if (near == null) {
		if (!nodesEditable) {
			setAsSelected(null);
		}
	}
	if (near instanceof Node) {
		if ((shiftKeyPressed || !nodesEditable) && (selectedElement instanceof Node)
				&& selectedElement != near) {
			if (edgesEditable) {
				handleEdgeChange(selectedElement, near, false);
				if (!shiftKeyPressed) {
					near = null;
				}
			} else if (heuristicsEditable) {
				handleHeuristicChange(selectedElement, near, false);
				if (!shiftKeyPressed) {
					near = null;
				}
			}
		}
		setAsSelected(near);
	} else if (near instanceof Edge) {
		setAsSelected(near);
	} else if (near instanceof Heuristic) {
		setAsSelected(near);
	}
	if (canvasButtonsVisible) {
		var index = getNearCanvasButton(rx, ry);
		if (index != null) {
			handleCanvasButtonClick(index);
		}
	}
}

function handleRightClick(x, y) {
	var near = getNearElement(x, y);
	if (near instanceof Node) {
		var canDelete = true;
		if (shiftKeyPressed && (selectedElement instanceof Node) && selectedElement != near) {
			if (edgesEditable && handleEdgeChange(selectedElement, near, true)) {
				canDelete = false;
			} else if (heuristicsEditable
					&& handleHeuristicChange(selectedElement, near, true)) {
				canDelete = false;
			}
			setAsSelected(near);
		}
		if (canDelete && nodesEditable) {
			near.remove();
		}
	} else if (near instanceof Edge) {
		if (edgesEditable) {
			near.remove();
		}
	} else if (near instanceof Heuristic) {
		if (heuristicsEditable) {
			near.remove();
		}
	} else if (nodesEditable && shiftKeyPressed && near == null
			&& (selectedElement instanceof Node)) {
		if (edgesEditable || heuristicsEditable) {
			var newNode = new Node(x, y);
			if (edgesEditable) {
				selectedElement.connectTo(newNode, true);
			} else {
				selectedElement.setHeuristicTo(newNode, true);
			}
			setAsSelected(newNode);
			setAsHovered(newNode);
		}
	}
}

var showName = null;

function handleMousemove(x, y, rx, ry) {
	var aux = getNearElementForced(x, y);
	showName = aux;
	if (mouseIsDown && nodesEditable && !caughtUpNode &&
			(mouseDownStart.element instanceof Node)) {
		var node = mouseDownStart.element;
		var distance = getDistance(node.x, node.y, x, y);
		if (distance >= minMoveDistance/getScale()) {
			setAsSelected(node);
			caughtUpNode = node;
			preventClick = true;
		}
	}
	if (caughtUpNode && nodesEditable) {
		if (ctrlKeyPressed) {
			caughtUpNode.x = Math.round(x / gridSize) * gridSize;
			caughtUpNode.y = Math.round(y / gridSize) * gridSize;
		} else {
			caughtUpNode.x = x;
			caughtUpNode.y = y;
		}
		canvasUpdated = false;
	} else {
		if (canvasButtonsVisible) {
			var index = getNearCanvasButton(rx, ry);
			setAsHoveredButtonIndex(index);
			if (index == null) {
				setAsHovered(getNearElement(x, y));
			}
		} else {
			setAsHovered(getNearElement(x, y));
		}
	}
}

function handleWheel(delta) {
	mulLen *= (1000 - delta)*0.001;
}

function handleMousedown(x, y) {
	mouseIsDown = true;
	mouseDownStart = {x: x, y: y, element: getNearElement(x, y)};
}

function handleMouseup(x, y, natural) {
	mouseIsDown = false;
	mouseDownStart = null;
	if (caughtUpNode) {
		caughtUpNode = null;
		graphUpdated = false;
	}
}