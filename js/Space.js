"use strict";

//$Space
function Space(svg, scale, dim, border, color, walls) {
	this.svg = svg || 'http://www.w3.org/2000/svg';
	this.scale = scale || 60;
	this.dim = dim || new Point(10, 10);
	this.border = border || 0;
	this.color = color || 'rgba(250,226,76,.6)';

	this.walls = [];

	if (walls) {
		for (var i = 0; i < walls.length; i ++) {
			var wall = walls[i];
			this.walls.push(new Point(wall.x, wall.y));
		}
	}

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

Space.prototype.drawPath = function(path) {
	var successor;
	var node;
	var i = path.length-2;
	var that = this;
	var timer = window.setInterval(function(){
		node = path[i];
		that.drawRec(that.createId('sol', node.state.x, node.state.y), node.state.x, node.state.y, '#ffcc00', 'solution');

		var j = 0;
		var timer2 = window.setInterval(function(node){
			successor = node.successors[j];
			if (!initialAgent.state.equalsTo(successor.state) && !goalAgent.state.equalsTo(successor.state))
				that.drawRec(that.createId('sol', successor.state.x, successor.state.y), successor.state.x, successor.state.y, '#23d400', 'solution');

			if (j === node.successors.length-1) {
				clearInterval(timer2);
			}

			j++;

		}, 5, node);


		if (i === 1) {
			clearInterval(timer);
		}

		i--;

	}, 100);
};
Space.prototype.drawWalls = function() {

	for (var i = 0; i < this.walls.length; i ++) {
		var wall = this.walls[i];
		this.createElement(this.createId('maze', wall.x, wall.y), wall.x, wall.y, 'transparent', 'maze');
	}
};

Space.prototype.removeDOMElement = function(element) {

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
	rect.setAttributeNS(null, 'stroke', '#' + '000');
	rect.setAttributeNS(null, 'stroke-width', '0');
	rect.setAttributeNS(null, 'class', cssClass || '');

	document.getElementById('svg-space').appendChild(rect);

	return rect;
};

Space.prototype.normalizeState = function (state){
	return new Point( state.x*this.scale+this.border,
		state.y*this.scale+this.border)

};

Space.prototype.paintElement = function (x, y, color){
	color = color || '#f7e28b';
	var rect = document.getElementById(y + '-'+ x);
	rect.setAttributeNS(null, 'fill', color);
};

Space.prototype.moveFromTo = function(el, from, to) {

	var path = this.findPath(from, to);

	return path;
};

Space.prototype.move = function(agent, action) {

	var currentState = agent.state;
	var nextState = currentState.add(action.state);
	var validPath;
	var path = [];

	while (true) {
		validPath = this.findPath(currentState, nextState);
		path.push(currentState);

		if (!validPath.length) {
			return path;
		}

		currentState = validPath[0].state;
		nextState = currentState.add(action.state);
		console.log(nextState);
	}

	return null;
};

Space.prototype.bindClickEvent = function () {
	var self = this;

	this.svgEl.onclick = function(e) {
		var event = e ? e : event;
		var targetElement = event.target;

		var x = Math.floor((event.offsetX - self.border) / self.scale);
		var y = Math.floor((event.offsetY - self.border) / self.scale);

		if (targetElement.classList.contains('wall')) {
			space.removeDOMElement(targetElement);

			self.walls = self.walls.filter(function(state){
				if (state.x === x && state.y === y) {
					return false;
				}

				return true;
			});
		} else if (targetElement.classList.contains('bg') || targetElement.classList.contains('solution')) {

			self.createElement(self.createId('wall', x, y), x, y, '#A52A2A', 'wall');

			self.walls.push(new Point(x,y));

		}

	};

};

Space.prototype.showElement = function (el){
	this.removeDOMElement(el);

	document.getElementById('svg-space').appendChild(el);
};

Space.prototype.findPath = function(from, to) {
	var startTime = new Date().getTime();

	from = new Point(from.x,from.y);
	to = new Point(to.x, to.y);

	var w = document.getElementById('weight');

	w = w ? w.value : 1;
	//console.log(w);

	var pathFinder = new PathFinder(from, to, this.dim, w);

	pathFinder.setDeniedStates(this.walls);

	var result = pathFinder.AEstrela();

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
			self.removeDOMElement(el);
		});
		els = document.getElementsByClassName('solution');
	}
};

Space.prototype.createElement = function(id, x, y, color, cssClass) {

	return this.drawRec(id, x, y, color, cssClass);

};