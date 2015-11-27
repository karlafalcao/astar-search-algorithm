function Space(svg, sqLen, sqQty, walls) {
	this.svg = svg || '';
	this.sqLen = sqLen || 60;
	this.sqQty = sqQty || 10;
	this.walls = walls || [];

	this.svgEl = document.getElementsByTagNameNS(this.svg, 'svg')[0];

	this.svgEl.setAttributeNS(null, 'width', String(sqLen * sqQty + 20));
	this.svgEl.setAttributeNS(null, 'height', String(sqLen * sqQty + 20));
}

Space.prototype.draw = function() {

	for (var x = 0; x < this.sqQty; x ++) {
		for (var y = 0; y < this.sqQty; y ++) {
			this.drawRec(this.createId('bg',x,y), x, y, 'rgba(250,226,76,.6)', 'bg');
		}
	}
};

Space.prototype.removeElement = function(element) {

	if (element.parentNode) {
		element.parentNode.removeChild(element);
	}
};

Space.prototype.createId = function(prefix, x, y){
	var id = prefix || '';
	if (x !== undefined && y !== undefined) {
		id = prefix + '-' + x + '-'+ y;
	}

	return id;
};

Space.prototype.drawRec = function (id, x, y, color, cssClass){

	var rect = document.createElementNS(this.svg, 'rect');
	rect.setAttributeNS(null, 'id', id);
	rect.setAttributeNS(null, 'x', String(x*this.sqLen+10));
	rect.setAttributeNS(null, 'y', String(y*this.sqLen+10));
	rect.setAttributeNS(null, 'height', String(this.sqLen));
	rect.setAttributeNS(null, 'width', String(this.sqLen));
	rect.setAttributeNS(null, 'fill', color);
	rect.setAttributeNS(null, 'stroke', '#' + 'fff');
	rect.setAttributeNS(null, 'class', cssClass || '');

	document.getElementById('svg-space').appendChild(rect);

	return rect;
};


Space.prototype.paintElement = function (x, y, color){
	color = color || '#f7e28b';
	var rect = document.getElementById(y + '-'+ x);
	rect.setAttributeNS(null, 'fill', color);
};

Space.prototype.moveFromTo = function(el, from, to) {

	var path = this.findPath(from, to);

	if (el && path.length > 0) {
		this.showElement(el);

//			var animation = document.createElementNS(this.svg, 'animateTransform');
//			animation.setAttributeNS(null, 'attributeName', 'transform');
//			animation.setAttributeNS(null, 'type', 'translate');
//			animation.setAttributeNS(null, 'from', String(from.x*this.sqLen) + ' ' + String(from.x*this.sqLen));
//			animation.setAttributeNS(null, 'to', String(to.x*this.sqLen) + ' ' + String(to.y*this.sqLen));
//			animation.setAttributeNS(null, 'dur', '10s');
//
//			el.appendChild(animation);

		el.setAttributeNS(null, 'transform', 'translate('+ String(to.x*this.sqLen) + ' ' + String(to.y*this.sqLen) + ')');

	}

	return path;
};

Space.prototype.setEvents = function () {
	var self = this;
	var keyPressed = false;

	this.svgEl.onclick = function(e) {
		var event = e ? e : event;
		var targetElement = event.target;

		var x = Math.floor((event.offsetX - 10) / self.sqLen);
		var y = Math.floor((event.offsetY - 10) / self.sqLen);

		if (targetElement.classList.contains('wall')) {
			space.removeElement(targetElement);

			self.walls = self.walls.filter(function(state){
				if (state.x === x && state.y === y) {
					return false;
				}

				return true;
			});
		} else if (targetElement.classList.contains('bg') || targetElement.classList.contains('solution')) {

			self.drawRec(self.createId('wall', x, y), x, y, '#A52A2A', 'wall');

			self.walls.push(new Point(x,y));

		}

	};

	//Register the keydown event handler:
	document.onkeydown = function(e) {
		var evt = e ? e : event;

		var keyCode = evt.keyCode;
		var sModifiers = ''
			+(evt.ctrlKey  ? 'Ctrl ' :'')
			+(evt.shiftKey ? 'Shift ':'')
			+(evt.altKey   ? 'Alt '  :'') ;

		if (!keyPressed && (37 <= keyCode && keyCode <= 40)) {
			evt.preventDefault();

			console.log('keyCode='+keyCode);

			keyPressed = true;

			return false;
		};

		return true;
	};


	window.onkeyup = function(e) {
		var evt = e ? e : event;
		keyPressed = false;
	};

};

Space.prototype.showElement = function (el){
	this.removeElement(el);

	document.getElementById('svg-space').appendChild(el);

};

Space.prototype.findPath = function(start, end) {
	var startTime = new Date().getTime();

	var initial = new Point(start.x,start.y);
	var goal = new Point(end.x, end.y);

	var w = document.getElementById('weight').value;
	console.log(w);

	var problemSolvingAgent = new ProblemSolvingAgent(initial, goal, w);

	problemSolvingAgent.setDeniedStates(this.walls);

	if (problemSolvingAgent.isOverflow(initial) || problemSolvingAgent.isDenied(initial)
		|| problemSolvingAgent.isOverflow(goal) || problemSolvingAgent.isDenied(goal))
		return false;

	var result = problemSolvingAgent.AEstrela();

	var endTime = new Date().getTime();

	var time = endTime - startTime;

	console.log('Execution time: ' + time/1000.0 + 'seconds');

	return result;
};

Space.prototype.clearPath = function() {
	var self = this;
	var els = document.getElementsByClassName('solution');

	while (els.length > 0) {
		Array.prototype.forEach.call(els, function(el) {
			// Do stuff with the element
			console.log(el.tagName);
			self.removeElement(el);
		});
		els = document.getElementsByClassName('solution');
	}
};

Space.prototype.createElement = function(id, point, color) {

	return space.drawRec(id, point.x, point.y, color);

};


// Agent ########################################

function Agent(name, state, color) {
	this.name = name || 'agent';
	this.state = state || new Point(0,0);
	this.color = color || '#000';
	this.element = [];
}

Agent.prototype.drawInSpace = function(space) {
	this.element = space.createElement(this.name, this.state, this.color);
};

Agent.prototype.showInSpace = function(space) {
	if(this.element) {
		space.showElement(this.element);
	} else {
		console.log('Element undefined');
	}
};

Agent.prototype.bindDragNDrop = function(space) {
	var self = this;
	var dragData = null;

	this.element.addEventListener('mousedown', function(ev) {
		if(!dragData) {
			ev=ev||event;
			var x = Math.floor((ev.offsetX - 10) / space.sqLen);
			var y = Math.floor((ev.offsetY - 10) / space.sqLen);

			dragData = {
				x:  ev.clientX-self.element.offsetLeft,
				y: ev.clientY-self.element.offsetTop
			};

			//console.log(dragData);

			space.svgEl.addEventListener('mousemove', dragging, false);
			space.svgEl.addEventListener('mouseup', stopDrag, false);
		};
	});

	function dragging(ev) {
		if(dragData) {
			ev = ev || event;

			var x = Math.floor((ev.offsetX - 10) / space.sqLen);
			var y = Math.floor((ev.offsetY - 10) / space.sqLen);

			self.state = new Point(x, y);

			self.element.setAttributeNS(null, 'x', String(x*space.sqLen+10));
			self.element.setAttributeNS(null, 'y', String(y*space.sqLen+10));

		}
	}

	function stopDrag(ev) {
		if(dragData) {
			var x = Math.floor((ev.offsetX - 10) / space.sqLen);
			var y = Math.floor((ev.offsetY - 10) / space.sqLen);

			self.state = new Point(x, y);

			self.element.setAttributeNS(null, 'x', String(x*space.sqLen+10));
			self.element.setAttributeNS(null, 'y', String(y*space.sqLen+10));

			dragData = null;
			space.svgEl.removeEventListener('mousemove', dragging, false);
			space.svgEl.removeEventListener('mouseup', stopDrag, false);
		}
	}
};
