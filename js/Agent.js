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
	this.node = new PFNode(new Point(oX,oY))
}

Agent.prototype.setState = function(state) {
	this.state = state;
	this.node.state = state;
};

Agent.prototype.draw = function() {
	this.element = this.space.createElement(this.name, this.node.state.x, this.node.state.y, this.color);
};

Agent.prototype.show = function() {
	if(this.element) {
		this.space.showElement(this.element);
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

Agent.prototype.broadcast = function(eventName, data){
	var event = new CustomEvent(eventName, {detail: data});

	this.element.dispatchEvent(event);

	return event;
};


Agent.prototype.on = function(eventName, eventFn){
	if (this.element.addEventListener) {
		this.element.addEventListener(eventName, eventFn, false);
	} else {
		this.element.attachEvent(eventName, eventFn);
	}
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