"use strict";

//$PFNode prototype

function PFNode (state, parent, action, pathCost, depth) {
	this.state = state || new Point();
	this.parent = parent || {};
	this.action = action || '' ;
	this.pathCost = pathCost || 0 ;
	this.depth = depth || 0 ;
	this.successors = [] ;
};

PFNode.prototype.state = null;
PFNode.prototype.parent = null;
PFNode.prototype.action = null;
PFNode.prototype.pathCost = null;
PFNode.prototype.depth = null;
PFNode.prototype.successors = null;


PFNode.prototype.solution = function() {

	if (this.depth === 0) {
		return [this];
	}

	return new Array(this).concat(this.parent.solution());
};

//$Queue prototype

function Queue(queue) {
	this.queue = queue || [];
}
Queue.prototype.queue = null; // Contains Nodes

Queue.prototype.sort =	function(problem){
	this.queue.sort(function(n1, n2){
		var h1 =  n1.state.dist(problem.goalState) * problem.weight;
		var h2 =  n2.state.dist(problem.goalState) * problem.weight;
		return (n1.pathCost + h1) - (n2.pathCost + h2);
	});
};

Queue.prototype.isEmpty =	function(queue){
	return this.queue.length === 0;
};

Queue.prototype.insert = function(node){
	this.queue.unshift(node);
};

Queue.prototype.insertAll = function(nodes){
	for (var i in nodes) {
		var node = nodes[i];
		this.insert(node);
	}
};

Queue.prototype.pop = function(){
	return this.queue.shift();
};

Queue.prototype.head = function(){
	return this.queue[0];
};

Queue.prototype.tail = function(){
	return this.queue[this.queue.length];
};


//$PathFinder

function PathFinder(initialState, goalState, dim, weight) {
	this.initialState = initialState || new Point();
	this.goalState = goalState || new Point();
	this.dim = dim || new Point(10, 10);
	this.weight = weight || 0;
	this.deniedStates = [];
	this.closedStates = [];
	this.actions = ACTIONS || [];
}

PathFinder.prototype.initialState = null;
PathFinder.prototype.goalState = null;
PathFinder.prototype.deniedStates = null;
PathFinder.prototype.closedStates = null;


PathFinder.prototype.isClosed = function(state) {
	return this.closedStates.some(function(closed){
		return closed.equalsTo(state);
	});
};

PathFinder.prototype.insertClosed = function(state) {
	return this.closedStates.push(state);
};

PathFinder.prototype.setDeniedStates = function(states) {
	for (var i=0; i<states.length; i++) {
		this.deniedStates.push(states[i]);
	}
};

PathFinder.prototype.isOverflow = function(state) {
	if (state.x >= this.dim.x || state.y >= this.dim.y|| state.x < 0 || state.y < 0) {
		return true;
	}

	return false;
};

PathFinder.prototype.isDenied = function(state) {
	return this.deniedStates.some(function(denied){
		return denied.equalsTo(state);
	});
};


PathFinder.prototype.getResultActions = function(state) {

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

PathFinder.prototype.expand = function(node) {
	var successors = [];

	for (var actionName in this.actions) {
		var action = this.actions[actionName];

		var stateResult = node.state.move(action.state);

		if (this.isOverflow(stateResult) || this.isDenied(stateResult) || this.isClosed(stateResult)) continue;

		var pathCost = node.pathCost + action.cost;
		pathCost = Math.floor(pathCost);

		var depth = node.depth + 1;

		var successor = new PFNode(stateResult, node, actionName, pathCost, depth);

		successors.push(successor);
	}

	return successors;
};

PathFinder.prototype.AEstrela = function() {
	var node;
	var successors;
	var initialNode = new PFNode(this.initialState);
	var fringe = new Queue();

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

PathFinder.prototype.goalTest = function(state) {
	return this.goalState.equalsTo(state);
};

function init() {
	var initial = new Point(0,0);

	var goal = new Point(1,1);

	var problemSolvingAgent = new PathFinder(initial, goal);

	var result = problemSolvingAgent.AEstrela();
	console.log(result);

}

//init();