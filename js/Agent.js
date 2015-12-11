"use strict";

//$Agent

function Agent(name, x, y, color, space) {
	this.name = name || 'agent';
	this.color = color || '#000';
	this.space = space || new Space();
	this.element = [];

	var oX = x || 0;
	var oY = y || 0;
	this.state = new Point(oX,oY);
}

Agent.prototype.draw = function() {
	this.element = this.space.createElement(this.name, this.state.x, this.state.y, this.color);
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

	var path = space.moveFromTo(this.element, this.state, stateResult);

	if (this.element && path.length > 0) {

		for (var i = 0; i < path.length-1; i++) {
			var node = path[i];
			this.element.setAttributeNS(null, 'x', String(stateResult.x*space.scale+space.border));
			this.element.setAttributeNS(null, 'y', String(stateResult.y*space.scale+space.border));

			this.animateSprite(node);
		}

		this.state = stateResult;
	}

	return path;

};

Agent.prototype.animateSprite = function(actionKey) {
	var fillAttr = this.element.getAttribute('fill');

	var patternId = fillAttr.slice(fillAttr.indexOf('#')+1, fillAttr.indexOf(')'));
	var patternIdEl = document.getElementById(patternId);
	if (patternIdEl) {
		var imageElem = document.getElementById(patternId).querySelector('image');
		imageElem.setAttribute('class', actionKey);
	}
};


Agent.prototype.stopSpriteAnimation = function() {
	var fillAttr = this.element.getAttribute('fill');

	var patternId = fillAttr.slice(fillAttr.indexOf('#')+1, fillAttr.indexOf(')'));
	var patternIdEl = document.getElementById(patternId);
	if (patternIdEl) {
		var imageElem = document.getElementById(patternId).querySelector('image');
		imageElem.setAttribute('class', '');
	}
};