"use strict";

//$Point

function Point(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

Point.prototype.x = null;
Point.prototype.y = null;
Point.prototype.add = function(v) {
	return new Point(this.x + v.x, this.y + v.y);
};

Point.prototype.sub = function(v) {
	return new Point(this.x - v.x, this.y - v.y);
};

Point.prototype.lenSq = function() {
	return this.x*this.x + this.y*this.y;
};

Point.prototype.len = function() {
	return Math.sqrt(this.lenSq());
};

Point.prototype.perp = function() {
	return new Point(-this.y, this.x);
};

Point.prototype.scale = function(s) {
	return new Point(this.x * s, this.y * s);
};

Point.prototype.norm = function() {
	return this.scale(1.0/this.len());
};

Point.prototype.move = function(move){

	var result = this.add(move);
	return result;
};

Point.prototype.dist = function(v) {
	return this.sub(v).len();
};

Point.prototype.equalsTo = function(v){
	if (this.x === v.x && this.y === v.y) {
		return true;
	}
	return false;
};

Point.prototype.biggerThan = function(v){
	if (this.x > v.x && this.y > v.y) {
		return true;
	}
	return false;
};

Point.prototype.lessThan = function(v){
	if (this.x < v.x && this.y < v.y) {
		return true;
	}
	return false;
};


//$ACTIONS constant
var ACTIONS = {
	'down' 		: 	{
		state: new Point(0, 1),
		cost	: 1.0
	},
	'right'		: 	{
		state: new Point(1, 0),
		cost	: 1.0
	},
	'up'		: 	{
		state: new Point(0, -1),
		cost	: 1.0
	},
	'left'		:	{
		state: new Point(-1, 0),
		cost	: 1.0
	},
	'down-right'	: 	{
		state: new Point(1, 1),
		cost	: 1.4
	},
	'down-left'	:	{
		state: new Point(-1, 1),
		cost	: 1.4
	},
	'up-right':	{
		state:	new Point(1, -1),
		cost	: 1.4
	},
	'up-left'	:	{
		state: new Point(-1, -1),
		cost	: 1.4
	},
};