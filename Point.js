/**
 * Created by karla on 11/24/15.
 */

"use strict";

function Point(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

Point.prototype.x = null;
Point.prototype.y = null;
Point.prototype.z = null;
Point.prototype.add = function(v) {
	return new Point(this.x + v.x, this.y + v.y, this.z + v.z);
};

Point.prototype.sub = function(v) {
	return new Point(this.x - v.x, this.y - v.y, this.z - v.z);
};

Point.prototype.lenSq = function() {
	return this.x*this.x + this.y*this.y + this.z*this.z;
};

Point.prototype.len = function() {
	return Math.sqrt(this.lenSq());
};

Point.prototype.perp = function() {
	return new Point(-this.y, this.x, this.z);
};

Point.prototype.scale = function(s) {
	return new Point(this.x * s, this.y * s, this.z * s);
};

Point.prototype.norm = function() {
	return this.scale(1.0/this.len());
};

Point.prototype.removeAxis = function(){
	return [this.x, this.y, this.z];
};

Point.prototype.cross = function(v){
	return new Point(this.x * v.z - v.x * this.z, this.y * v.z - v.y * this.z, this.x * v.y - v.x * this.y);
};