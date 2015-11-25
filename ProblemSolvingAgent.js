"use strict";

//var ProblemSolvingAgent = {
//	actions: {
//		       'up' : 	function(nodeState){},
//		     'right': 	function(nodeState){},
//			  'down': 	function(nodeState){},
//			  'left':	function(nodeState){},
//		  'up-right': 	function(nodeState){},
//		   'up-left':	function(nodeState){},
//		'down-right':	function(nodeState){},
//		 'down-left':	function(nodeState){},
//	},
//	node: {
//		     parent:	{},
//		     action:	{},
//		      state:	{}, //Node resultant?
//		      depth:	1,
//		   pathCost:	0,
//	},
//	fringe: {
//		      queue:	[],
//		       sort:	function(queue){},
//		  	isEmpty:	function(queue){},
//		  insertAll:	function(nodeList){},
//		     insert:	function(node){},
//				pop:	function(){},
//	},
//	problem: {
//		initialState:	{}, //A node
//		   goalState:	{}, //A node
//		 successorFn:	function(state){},
//		    goalTest:	function(nodeState){},
//			makeNode:	function(parent, action){},
//		      search:	function(){},
//		    solution:	function(node){} //Segue de acoes obtidas seguindo os ponteiros do pai(parent) de volta para a raiz
//	},
//
//}

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

Point.prototype.distSq = function() {
	return this.x*this.x + this.y*this.y;
};

Point.prototype.dist = function() {
	return Math.sqrt(this.distSq());
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

Point.prototype.move = function(movement){

	var result = this.add(movement);

	if (!result.isValid()) {
		return null
	}

	return result;
};

Point.prototype.isValid = function(){
	if (this.x > 10 || this.y > 10) {
		return false;
	}
	return true;
};

//$Node prototype

function Node (state, parent, action, pathCost, depth) {
	this.state = state || new Point();
	this.parent = parent || '' ;
	this.action = action || '' ;
	this.pathCost = pathCost || 0 ;
	this.depth = depth || 0 ;
};

Node.prototype.state = null;
Node.prototype.parent = null;
Node.prototype.action = null;
Node.prototype.pathCost = null;
Node.prototype.depth = null;


Node.prototype.expand = function() {
	var successors = [];

	for (var actionName in ACTIONS) {
		var action = ACTIONS[actionName];

		var result = this.state.move(action.movement);

		if (!result) continue;

		var pathCost = this.pathCost + action.cost;

		var depth = this.depth + 1;

		var successor = new Node(result, this, actionName, pathCost, depth);

		successors.push(successor);
	}

	return successors;
};

Node.prototype.solution = function() {

};

//$Fringe prototype

function Fringe(queue) {
	this.queue = queue || [];
}
Fringe.prototype.queue = null;

Fringe.prototype.sort =	function(queue){};
Fringe.prototype.isEmpty =	function(queue){};
Fringe.prototype.insert = function(node){};
Fringe.prototype.insertAll =	function(nodeList){};
Fringe.prototype.pop = function(){};

var ACTIONS = {
	'up' 		: 	{
		movement: new Point(0, 1),
		cost	: 1.0
	},
	'right'		: 	{
		movement: new Point(1, 0),
		cost	: 1.0
	},
	'down'		: 	{
		movement: new Point(0, -1),
		cost	: 1.0
	},
	'left'		:	{
		movement: new Point(-1, 0),
		cost	: 1.0
	},
	'up-right'	: 	{
		movement: new Point(1, 1),
		cost	: 1.4
	},
	'up-left'	:	{
		movement: new Point(1, -1),
		cost	: 1.4
	},
	'down-right':	{
		movement:	new Point(1, -1),
		cost	: 1.4
	},
	'down-left'	:	{
		movement: new Point(-1, -1),
		cost	: 1.4
	},
};

//$ProblemSolvingAgent

function ProblemSolvingAgent() {}

ProblemSolvingAgent.prototype.initialState = null;
ProblemSolvingAgent.prototype.goalState = null;
ProblemSolvingAgent.prototype.search = function() {};
ProblemSolvingAgent.prototype.goalStateTest = function() {};
ProblemSolvingAgent.prototype.makeNode = function() {};