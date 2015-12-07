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



//$Node prototype

function Node (state, parent, action, pathCost, depth) {
	this.state = state || new Point();
	this.parent = parent || {};
	this.action = action || '' ;
	this.pathCost = pathCost || 0 ;
	this.depth = depth || 0 ;
	this.successors = [] ;
};

Node.prototype.state = null;
Node.prototype.parent = null;
Node.prototype.action = null;
Node.prototype.pathCost = null;
Node.prototype.depth = null;
Node.prototype.successors = null;


Node.prototype.solution = function() {

	if (this.depth === 0) {
		return [this];
	}

	return new Array(this).concat(this.parent.solution());
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
	}
};

Fringe.prototype.pop = function(){
	return this.queue.shift();
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

//$ProblemSolvingAgent

function ProblemSolvingAgent(initialState, goalState, dim, weight) {
	this.initialState = initialState || new Point();
	this.goalState = goalState || new Point();
	this.dim = dim || new Point(10, 10);
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
	if (state.x >= this.dim.x || state.y >= this.dim.y|| state.x < 0 || state.y < 0) {
		return true;
	}

	return false;
};

ProblemSolvingAgent.prototype.isDenied = function(state) {
	return this.deniedStates.some(function(denied){
		return denied.equalsTo(state);
	});
};


ProblemSolvingAgent.prototype.getResultActions = function(state) {

	var action;
	var resultActions = {};

	var actions = {
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

	for (var actionName in actions) {
		action = actions[actionName];

		var resultAction = state.move(action.state);

		if (this.isOverflow(resultAction) || this.isDenied(resultAction) || this.isClosed(resultAction)){
			continue;
		}

		resultActions[actionName] = {
			state: resultAction,
			cost: action.cost
		};
	}

	return resultActions;

};

ProblemSolvingAgent.prototype.expand = function(node) {
	var successors = [];

	for (var actionName in ACTIONS) {
		var action = ACTIONS[actionName];

		var stateResult = node.state.move(action.state);

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

	if (this.isOverflow(this.initialState) || this.isDenied(this.initialState)
		|| this.isOverflow(this.goalState) || this.isDenied(this.goalState))
		return [];

	fringe.insert(initialNode);

	while (true) {
		if (fringe.isEmpty()) {
			return [];
		}
		//Makes initial node
		node = fringe.pop();

		if (this.goalTest(node.state)) {

			return node.solution();
		}

		if (!this.isClosed(node.state)) {
			this.insertClosed(node.state);
			successors = this.expand(node);
			node.successors = successors;
			
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