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

function initLayout(svg, options, mouseDownHandler, mouseUpHandler) {
	var layout = options.layout;
	var n = options.keyNum;
	var offs = options.keyOffs;
	var kw = options.keyWidth;
	var kh = options.keyHeight;
	var keyElements = {};
	
	for(var i = 0; i < n; ++i) {
		var e = svg.rectfill(kw * i, 0, kw * (i + 1), kh, "white", "black");
		e.originalFillColor = "white";
		e.keyIndex = whiteKeyIndex(layout, i + offs);
		
		if(mouseDownHandler)
			e.addEventListener("mousedown", mouseDownHandler, false);
		
		//e.addEventListener("mouseup", mouseUpHandler, false);
		keyElements[e.keyIndex] = e;
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
			e.keyIndex = i;
			
			if(mouseDownHandler)
				e.addEventListener("mousedown", mouseDownHandler, false);
			
			//e.addEventListener("mouseup", mouseUpHandler, false);
			keyElements[i] = e;
		}
		++i;
	}
	
	return keyElements;
}

function KeyboardOptions() {
		this.layout = ['w', 'b', 'w', 'b', 'w', 'w', 'b', 'w', 'b', 'w', 'b', 'w'];
		this.keyNum = 52;
		this.keyOffs = 5+7;
		this.keyWidth = 20;
		this.keyHeight = 60;
		this.pressable = true;
}

function Keyboard(options) {
	options = options || new KeyboardOptions();
	
	var self = this;
	var lastPressedKey = -1;
	
	var mouseDown = function(e) {
		self.keyDown(e.target.keyIndex);
		
		if(self.onKeyDown)
			self.onKeyDown(self, e.target.keyIndex);
		
		lastPressedKey = e.target.keyIndex;
		//console.log("down", e.target.keyIndex);
	};
	
	//var mouseUp = function(e) {
		//self.keyUp(e.target.keyIndex);
		//console.log("up", e.target.keyIndex);
	//};
	
	if(options.pressable) {
		document.addEventListener("mouseup", function() {
			if(lastPressedKey < 0)
				return;
			
			self.keyUp(lastPressedKey);
			
			if(self.onKeyUp)
				self.onKeyUp(self, lastPressedKey);
			
			lastPressedKey = -1;
		}, false);
	}
	
	this.svg = new SVG(options.keyWidth * options.keyNum, options.keyHeight);
	this.keyElements = initLayout(this.svg, options, options.pressable ? mouseDown : null);
	
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

