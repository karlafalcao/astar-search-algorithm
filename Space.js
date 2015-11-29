function Space(svg, scale, dim, border, color) {
	this.svg = svg || '';
	this.scale = scale || 60;
	this.dim = dim || new Point(10, 10);
	this.border = border || 0;
	this.walls = [];
	this.color = color || 'rgba(250,226,76,.6)';

	this.svgEl = document.getElementsByTagNameNS(this.svg, 'svg')[0];

	this.svgEl.setAttributeNS(null, 'width', String(this.scale * this.dim.x + this.border * 2));
	this.svgEl.setAttributeNS(null, 'height', String(this.scale * this.dim.y + this.border * 2));
}

Space.prototype.draw = function() {

	for (var x = 0; x < this.dim.x; x ++) {
		for (var y = 0; y < this.dim.y; y ++) {
			this.drawRec(this.createId('bg',x,y), x, y, this.color, 'bg');
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
	rect.setAttributeNS(null, 'x', String(x*this.scale+this.border));
	rect.setAttributeNS(null, 'y', String(y*this.scale+this.border));
	rect.setAttributeNS(null, 'height', String(this.scale));
	rect.setAttributeNS(null, 'width', String(this.scale));
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

		el.setAttributeNS(null, 'x', String(to.x*this.scale+this.border));
		el.setAttributeNS(null, 'y', String(to.y*this.scale+this.border));
	}

	return path;
};

Space.prototype.bindClickEvent = function () {
	var self = this;

	this.svgEl.onclick = function(e) {
		var event = e ? e : event;
		var targetElement = event.target;

		var x = Math.floor((event.offsetX - self.border) / self.scale);
		var y = Math.floor((event.offsetY - self.border) / self.scale);

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

};

Space.prototype.showElement = function (el){
	this.removeElement(el);

	document.getElementById('svg-space').appendChild(el);
};

Space.prototype.findPath = function(from, to) {
	var startTime = new Date().getTime();

	from = new Point(from.x,from.y);
	to = new Point(to.x, to.y);

	var w = document.getElementById('weight');

	w = w ? w.value : 1;
	//console.log(w);

	var problemSolvingAgent = new ProblemSolvingAgent(from, to, this.dim, w);

	problemSolvingAgent.setDeniedStates(this.walls);

	var result = problemSolvingAgent.AEstrela();

	var endTime = new Date().getTime();

	var time = endTime - startTime;

	//console.log('Execution time: ' + time/1000.0 + 'seconds');

	return result;
};

Space.prototype.clearPath = function() {
	var self = this;
	var els = document.getElementsByClassName('solution');

	while (els.length > 0) {
		Array.prototype.forEach.call(els, function(el) {
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
			var x = Math.floor((ev.offsetX - space.border) / space.scale);
			var y = Math.floor((ev.offsetY - space.border) / space.scale);

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

			var x = Math.floor((ev.offsetX - space.border) / space.scale);
			var y = Math.floor((ev.offsetY - space.border) / space.scale);

			self.state = new Point(x, y);

			self.element.setAttributeNS(null, 'x', String(x*space.scale+space.border));
			self.element.setAttributeNS(null, 'y', String(y*space.scale+space.border));

		}
	}

	function stopDrag(ev) {
		if(dragData) {
			var x = Math.floor((ev.offsetX - space.border) / space.scale);
			var y = Math.floor((ev.offsetY - space.border) / space.scale);

			self.state = new Point(x, y);

			self.element.setAttributeNS(null, 'x', String(x*space.scale+space.border));
			self.element.setAttributeNS(null, 'y', String(y*space.scale+space.border));

			dragData = null;
			space.svgEl.removeEventListener('mousemove', dragging, false);
			space.svgEl.removeEventListener('mouseup', stopDrag, false);
		}
	}
};


Agent.prototype.moveInSpace = function(space, keyAction) {
	var action = ACTIONS[keyAction];
	
	var stateResult = this.state.add(action.state);

	var result = space.moveFromTo(this.element, this.state, stateResult);

	if (result.length > 0){
		this.state = stateResult;
	}
};