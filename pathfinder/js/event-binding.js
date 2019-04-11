window.addEventListener("load", function(){
	
	function toggleCheckbox(element) {
		return toggleClass(element, "checked");
	}

	function toggleSwitchButton(element) {
		return toggleClass(element, "active");
	}

	function setSwitchButton(element, value) {
		(value ? addClass : removeClass)(element, "active");
	}

	canvas = get("canvas");
	ctx = canvas.getContext("2d");

	canvas.addEventListener("mousemove", function(event) {
		if (!(event.buttons && 1) && mouseIsDown) {
			handleMouseup(null, null, false);
		}
		var x = event.offsetX;
		var y = event.offsetY;
		var rx = x;
		var ry = y;
		var pos = {x: x, y: y};
		invCoord(pos, pos);
		x = pos.x;
		y = pos.y;
		setCtrlKeyState(event.ctrlKey);
		setShiftKeyState(event.shiftKey);
		handleMousemove(x, y, rx, ry);
		update();
	});

	canvas.addEventListener("wheel", function(event) {
		if (forcesCode !== null) {
			handleWheel(event.deltaY);
		}
	});

	canvas.addEventListener("mousedown", function(event) {
		event.preventDefault();
		if (event.button == 0) {
			var x = event.offsetX;
			var y = event.offsetY;
			var pos = {x: x, y: y};
			invCoord(pos, pos);
			x = pos.x;
			y = pos.y;
			handleMousedown(x, y);
		}
		update();
	});

	canvas.addEventListener("contextmenu", function(event) {
		var x = event.offsetX;
		var y = event.offsetY;
		var pos = {x: x, y: y};
		invCoord(pos, pos);
		x = pos.x;
		y = pos.y;
		event.preventDefault();
		setCtrlKeyState(event.ctrlKey);
		setShiftKeyState(event.shiftKey);
		handleRightClick(x, y);
		update();
	});

	canvas.addEventListener("mouseup", function(event) {
		if (event.button == 0) {
			var x = event.offsetX;
			var y = event.offsetY;
			var pos = {x: x, y: y};
			invCoord(pos, pos);
			x = pos.x;
			y = pos.y;
			handleMouseup(x, y, true);
		}
		update();
	});

	canvas.addEventListener("click", function(event) {
		var x = event.offsetX;
		var y = event.offsetY;
		var rx = x;
		var ry = y;
		var pos = {x: x, y: y};
		invCoord(pos, pos);
		x = pos.x;
		y = pos.y;
		setCtrlKeyState(event.ctrlKey);
		setShiftKeyState(event.shiftKey);
		handleLeftClick(x, y, rx, ry);
		update();
	});

	canvas.addEventListener("dblclick", function(event) {
		event.preventDefault();
		var x = event.offsetX;
		var y = event.offsetY;
		var rx = x;
		var ry = y;
		var pos = {x: x, y: y};
		invCoord(pos, pos);
		x = pos.x;
		y = pos.y;
		setCtrlKeyState(event.ctrlKey);
		setShiftKeyState(event.shiftKey);
		handleLeftClick(x, y, rx, ry);
		update();
	});

	window.addEventListener("keydown", function(e){
		var key = e.key.toLowerCase();
		if (key === "arrowright" || key === "right") {
			if (searchData && searchAnimationCode == null) {
				nextStepSearch();
			}
		} else if (key === "end") {
			if (searchData) {
				while (!searchData.isOver) {
					nextStepSearch();
				}
			}
		} else if (key === "esc" || key === "escape" || key === "scape") {
			if (searchData) {
				stopSearch();
				setNodesSelectable(true);
			} else {
				setAsSelected(null);
			}
		} else if (key === "delete" || key === "del") {
			if (selectedElement) {
				if (selectedElement instanceof Node) {
					if (nodesEditable) {
						selectedElement.remove();
					}
				} else if (selectedElement instanceof Edge) {
					if (edgesEditable) {
						selectedElement.remove();
					}
				} else if (selectedElement instanceof Heuristic) {
					if (heuristicsEditable) {
						selectedElement.remove();
					}
				}
			}
		} else if (key === "c") {
			centerGraph();
		} else if (key === "s") {
			shuffleGraph();
		} else if (key === "f") {
			toggleForces();
		}
		update();
	});

	window.addEventListener("keyup", function(e){
		var key = e.key.toLowerCase();
		if (key === "ctrl" || key === "control") {
			setCtrlKeyState(false);
		} if (key === "shift") {
			setShiftKeyState(false);
		}
		update();
	});

	window.addEventListener("resize", function(){
		verifyCanvasSize();
		update();
	});

	setClick("#search_button", function(){
		setNodesEditable(true);
		setEdgesSelectable(false);
		setHeuristicsSelectable(false);
		setFlagsEditable(true);
		if (get("[name=\"search_method\"].active") && orgNode && dstNode) {
			removeClass("#start_search", "disabled");
		} else {
			addClass("#start_search", "disabled");
		}
		removeClass(".selected", "selected");
		addClass(this, "selected");
		hide(".leftbar-content");
		show(".search-content");
		update();
	});

	forcesCode = null;
	function toggleForces() {
		if (forcesCode === null) {
			forcesCode = setInterval(function(){
				applyForce();
				update();
			}, 0);
		} else {
			clearInterval(forcesCode);
			forcesCode = null;
		}
	}

	setClick("#import_button", function(){
		stopSearch();
		setNodesEditable(true);
		// setNodesSelectable(false);
		setEdgesSelectable(false);
		setHeuristicsSelectable(false);
		setFlagsEditable(false);
		setFlagsVisible(true);
		removeClass(".selected", "selected");
		addClass(this, "selected");
		hide(".leftbar-content");
		show(".import-content");
		canvasUpdated = false;
		update();
	});

	setClick("#import_text", function(){
		readScript(getVal("#edit_script"));
		update();
	});

	setChange("#upload", function(){
		if (this.files.length) {
			var reader = new FileReader();
			reader.onload = function(e) {
				setVal("#edit_script", e.target.result);
			};
			reader.readAsText(this.files[0]);
		}
	});

	get("#import_button").click();

	setClick("#start_search", function(){
		if (hasClass(this, "disabled")) {
			return;
		}
		var activeButton = get(".search-content [name=\"search_method\"].active");
		if (!activeButton) {
			return;
		}
		startSearch(getParent(activeButton, ".line").querySelector(".text").innerHTML.trim());
		update();
	});

	setClick("[name=\"search_method\"]", function(){
		removeClass("[name=\"search_method\"].active", "active");
		if (orgNode && dstNode) {
			removeClass("#start_search", "disabled");
		} else {
			addClass("#start_search", "disabled");
		}
		setSwitchButton(this, true);
	});

	verifyCanvasSize();
	loadState();
	update();

});
