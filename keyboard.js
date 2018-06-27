function SVG(w, h) {
	this.width = w;
	this.height = h;
	
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("height", h);
	svg.setAttribute("width", w);
	
	this.svg = svg;
}

SVG.prototype.appendTo = function(el) {
	el.appendChild(this.svg);
}

SVG.prototype.line = function(x1, y1, x2, y2, color, stroke) {
	stroke = stroke || 1;
	var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', stroke);
	this.svg.appendChild(line);
	
	return e;
}

SVG.prototype.rect = function(x1, y1, x2, y2, color, stroke) {
	stroke = stroke || 1;
	var e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    e.setAttribute('x', x1);
    e.setAttribute('y', y1);
    e.setAttribute('width', x2 - x1);
    e.setAttribute('height', y2 - y1);
    e.setAttribute('stroke', color);
    e.setAttribute('stroke-width', stroke);
	e.setAttribute('fill-opacity', '0');
	e.setAttribute('stroke-opacity', '1');
	this.svg.appendChild(e);
	
	return e;
}

SVG.prototype.rectfill = function(x1, y1, x2, y2, fillColor, strokeColor) {
	var e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    e.setAttribute('x', x1);
    e.setAttribute('y', y1);
    e.setAttribute('width', x2 - x1);
    e.setAttribute('height', y2 - y1);
    e.setAttribute('fill', fillColor);
	e.setAttribute('fill-opacity', '1');
	if(strokeColor)
		e.setAttribute('stroke', strokeColor);
	e.setAttribute('stroke-opacity', strokeColor ? '1' : '0');
	this.svg.appendChild(e);
	
	return e;
}

function whiteKeyIndex(layout, n) {
	n += 1;
	for(var i = 0; n > 0; ++i) {
		if(layout[i % layout.length] === "w") {
			--n;
		}
	}
	
	return i - 1;
}

function drawLayout(svg, layout, n, offs, kw, kh) {
	var keyElements = {};
	
	for(var i = 0; i < n; ++i) {
		var e = svg.rectfill(kw * i, 0, kw * (i + 1), kh, "white", "black");
		e.originalFillColor = "white";
		keyElements[whiteKeyIndex(layout, i + offs)] = e;
	}
	
	var x = 0;
	var bkw = kw * 0.6;
	var whites = 0;
	
	i = whiteKeyIndex(layout, offs);
	if(layout[i % layout.length] === "b")
		++i;
	
	while(whites < n) {
		if(layout[i % layout.length] === "w") {
			x += kw;
			++whites;
		}
		else {
			var e = svg.rectfill(x - bkw / 2, 0, x + bkw / 2, kh * 0.6, "rgb(64, 64, 64)", "black");
			e.originalFillColor = "black";
			keyElements[i] = e;
		}
		++i;
	}
	
	return keyElements;
}

function Keyboard(layout, keyNum, keyOffs, keyWidth, keyHeight) {
	this.svg = new SVG(keyWidth * keyNum, keyHeight);
	this.keyElements = drawLayout(this.svg, layout, keyNum, keyOffs, keyWidth, keyHeight);
	
	/*
	var elems = this.keyElements;
	Object.keys(elems).forEach(function(key) {
		var e = elems[key];
		console.log(key);
	});*/
}

Keyboard.prototype.show = function() {
	this.svg.appendTo(document.body);
};

Keyboard.prototype.keyDown = function(keyNum) {
	this.keyElements[keyNum].setAttribute('fill', 'blue');
};

Keyboard.prototype.keyUp = function(keyNum) {
	this.keyElements[keyNum].setAttribute('fill', this.keyElements[keyNum].originalFillColor);
};

Keyboard.prototype.allKeysUp = function() {
	var elems = this.keyElements;
	
	Object.keys(elems).forEach(function(key) {
		var e = elems[key];
		e.setAttribute('fill', e.originalFillColor);
	});
};

