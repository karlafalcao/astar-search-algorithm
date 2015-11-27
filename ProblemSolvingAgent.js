"use strict";

//$Point

function Point(x, y) {
	var self = this;
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

Point.prototype.move = function(movement){

	var result = this.add(movement);
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


//$Node prototype

function Node (state, parent, action, pathCost, depth) {
	this.state = state || new Point();
	this.parent = parent || {};
	this.action = action || '' ;
	this.pathCost = pathCost || 0 ;
	this.depth = depth || 0 ;
};

Node.prototype.state = null;
Node.prototype.parent = null;
Node.prototype.action = null;
Node.prototype.pathCost = null;
Node.prototype.depth = null;


Node.prototype.solution = function() {
	space.drawRec(space.createId('sol', this.state.x, this.state.y), this.state.x, this.state.y, '#ffcc00', 'solution');

	if (this.depth === 0) {
		return [this.state];
	}

	return new Array(this.state).concat(this.parent.solution());
};

//$Fringe prototype

function Fringe(queue) {
	this.queue = queue || [];
}
Fringe.prototype.queue = null; // Contains Nodes

Fringe.prototype.sort =	function(problem){
	this.queue.sort(function(n1, n2){
		var h1 =  n1.state.dist(problem.goalState) * problem.weight;
		var h2 =  n2.state.dist(problem.goalState) * problem.weight;
		return (n1.pathCost + h1) - (n2.pathCost + h2);
	});
};

Fringe.prototype.isEmpty =	function(queue){
	return this.queue.length === 0;
};

Fringe.prototype.insert = function(node){
	this.queue.unshift(node);
};

Fringe.prototype.insertAll = function(nodes){
	for (var i in nodes) {
		var node = nodes[i];
		this.insert(node);
		space.drawRec(space.createId('sol', node.state.x, node.state.y), node.state.x, node.state.y, '#23d400', 'solution');
	}
};

Fringe.prototype.pop = function(){
	return this.queue.shift();
};

//$ACTIONS constant
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
		movement: new Point(-1, 1),
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

function ProblemSolvingAgent(initialState, goalState, weight) {
	this.initialState = initialState || new Point();
	this.goalState = goalState || new Point();
	this.weight = weight || 0;
	this.deniedStates = [];
	this.closedStates = [];
}

ProblemSolvingAgent.prototype.initialState = null;
ProblemSolvingAgent.prototype.goalState = null;
ProblemSolvingAgent.prototype.deniedStates = null;
ProblemSolvingAgent.prototype.closedStates = null;


ProblemSolvingAgent.prototype.isClosed = function(state) {
	return this.closedStates.some(function(closed){
		return closed.equalsTo(state);
	});
};

ProblemSolvingAgent.prototype.insertClosed = function(state) {
	return this.closedStates.push(state);
};

ProblemSolvingAgent.prototype.setDeniedStates = function(states) {
	for (var i=0; i<states.length; i++) {
		this.deniedStates.push(states[i]);
	}
};

ProblemSolvingAgent.prototype.isOverflow = function(state) {
	if (state.x > 9 || state.y > 9 || state.x < 0 || state.y < 0) {
		return true;
	}

	return false;
};

ProblemSolvingAgent.prototype.isDenied = function(state) {
	return this.deniedStates.some(function(denied){
		return denied.equalsTo(state);
	});
};

ProblemSolvingAgent.prototype.expand = function(node) {
	var successors = [];

	for (var actionName in ACTIONS) {
		var action = ACTIONS[actionName];

		var stateResult = node.state.move(action.movement);

		if (this.isOverflow(stateResult) || this.isDenied(stateResult) || this.isClosed(stateResult)) continue;

		var pathCost = node.pathCost + action.cost;
		pathCost = Math.floor(pathCost);

		var depth = node.depth + 1;

		var successor = new Node(stateResult, node, actionName, pathCost, depth);

		successors.push(successor);
	}

	return successors;
};

ProblemSolvingAgent.prototype.AEstrela = function() {
	var node;
	var successors;
	var initialNode = new Node(this.initialState);
	var fringe = new Fringe();
	fringe.insert(initialNode);

	while (true) {
		if (fringe.isEmpty()) {
			return false;
		}
		//Makes initial node
		node = fringe.pop();

		if (this.goalTest(node.state)) {

			return node.solution();
		}

		if (!this.isClosed(node.state)) {
			this.insertClosed(node.state);
			successors = this.expand(node);
			
			fringe.insertAll(successors);
			fringe.sort(this);
		}
	}
};

ProblemSolvingAgent.prototype.goalTest = function(state) {
	return this.goalState.equalsTo(state);
};

function init() {
	var initial = new Point(0,0);

	var goal = new Point(1,1);

	var problemSolvingAgent = new ProblemSolvingAgent(initial, goal);

	var result = problemSolvingAgent.AEstrela();
	console.log(result);

}

//init();