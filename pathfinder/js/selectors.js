function get(selector) {
	return document.querySelector(selector);
}

function getv(selector) {
	return document.querySelectorAll(selector);
}

function getClasses(element) {
	if ((typeof element) === "string")
		element = get(element);
	var classAttr = element.getAttribute("class");
	if (!classAttr)
		return [];
	return classAttr.split(" ");
}

function hasClass(element, className) {
	if ((typeof element) === "string")
		element = get(element);
	return getClasses(element).indexOf(className) >= 0;
}

function removeClass(element, className) {
	if ((typeof element) === "string")
		element = get(element);
	if (!element)
		return;
	var array = getClasses(element);
	var index = array.indexOf(className);
	if (index >= 0) {
		array.splice(index, 1);
		element.setAttribute("class", array.join(" "));
	}
}

function addClass(element, className) {
	if ((typeof element) === "string")
		element = get(element);
	if (!element)
		return;
	var array = getClasses(element);
	var index = array.indexOf(className);
	if (index < 0) {
		array.push(className);
		element.setAttribute("class", array.join(" "));
	}
}

function hide(element) {
	if ((typeof element) === "string") {
		var array = getv(element);
		for (var i=0; i<array.length; ++i) {
			array[i].style.display = "none";
		}
	} else {
		element.style.display = "none";
	}
}

function show(element) {
	if ((typeof element) === "string") {
		var array = getv(element);
		for (var i=0; i<array.length; ++i) {
			array[i].style.display = "block";
		}
	} else {
		element.style.display = "block";
	}
}

function setContent(element, content) {
	if ((typeof element) === "string") {
		var array = getv(element);
		for (var i=0; i<array.length; ++i) {
			array[i].innerHTML = content;
		}
	} else {
		element.innerHTML = content;
	}
}

function setClick(element, callback) {
	if ((typeof element) === "string") {
		var array = getv(element);
		for (var i=0; i<array.length; ++i) {
			array[i].addEventListener("click", callback);
		}
	} else {
		element.addEventListener("click", callback);
	}
}

function setChange(element, callback) {
	if ((typeof element) === "string") {
		var array = getv(element);
		for (var i=0; i<array.length; ++i) {
			array[i].addEventListener("change", callback);
		}
	} else {
		element.addEventListener("change", callback);
	}
}

function setKeyup(element, callback) {
	if ((typeof element) === "string") {
		var array = getv(element);
		for (var i=0; i<array.length; ++i) {
			array[i].addEventListener("keyup", callback);
		}
	} else {
		element.addEventListener("keyup", callback);
	}
}

function getParent(element, selector) {
	if ((typeof element) === "string")
		element = get(element);
	while ((element = element.parentElement)
		&& !element.matches(selector));
	return element;
}

function isChecked(element) {
	if ((typeof element) === "string")
		element = get(element);
	return hasClass(element, "checked");
}

function check(element) {
	if ((typeof element) === "string")
		element = get(element);
	return addClass(element, "checked");
}

function uncheck(element) {
	if ((typeof element) === "string")
		element = get(element);
	return removeClass(element, "checked");
}

function getVal(element) {
	if ((typeof element) === "string")
		element = get(element);
	return element.value;
}

function setVal(element, value) {
	if ((typeof element) === "string")
		element = get(element);
	element.value = value;
}

function toggleClass(element, className) {
	var array = getClasses(element);
	var index = array.indexOf(className);
	if (index < 0) {
		array.push(className);
		element.setAttribute("class", array.join(" "));
		return true;
	} else {
		array.splice(index, 1);
		element.setAttribute("class", array.join(" "));
		return false;
	}
}
