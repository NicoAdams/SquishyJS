// Generic utility functions

// Scales an argument smoothly from n1 at ratio=0 to n2 at ratio=1
// Examples:
//   smoothScale(10, 20, 0) -> 10
//   smoothScale(10, 20, 1) -> 20
//   smoothScale(10, 20, 0.3) -> 13
function smoothScale(n1, n2, ratio) {
	return n2*ratio + n1*(1-ratio)
}

function copyObject(obj) {
	return jQuery.extend({}, obj)
}

// -- Inheritance functions --

function extend(parent, child) {
	child.prototype = new parent()
	child.prototype.constructor = child
}

// -- Assert functions -- 

function assert(condition, msg) {
	if(!condition){
		failstr = "Failed assert"
		if(msg){failstr += ": "+msg}
		throw failstr
	}
}

function assertEq(a, b, msg) {
	if(a!=b){
		failstr = "Failed assertEq"
		failstr += " ("+String(a)+", "+String(b)+")"
		if(msg){failstr += ": "+msg}
		throw failstr
	}
}

// -- Inheritance functions --

function instanceOf(obj, type) {
	return obj.constructor == type
}

// -- Array functions --

// Copies an array (shallowly)
function copy(arr) {
	arr2 = []
	for (var i=0; i<arr.length; i++){
		arr2[i] = arr[i]
	}
	return arr2
}

// Returns a new array arr2 such that arr2[i] = func(arr[i])
function map(func, arr) {
	newArr = []
	for(var i=0; i<arr.length; i++) {
		newArr[i] = func(arr[i])
	}
	return newArr
}

// Joins two arrays of the same length using func
// Returns an array such that arr[i] = func(arr1[i], arr2[i])
function join(func, arr1, arr2) {
	
	if (arr1.length!=arr2.length)
	{
		throw "Arrays must be the same size";
	}
	
	newArr = []
	for(var i=0; i<arr1.length; i++) {
		newArr[i] = func(arr1[i], arr2[i])
	}
	return newArr
}

// Sums an array of any length
function sum(arr) {
	if(arr.length == 0){return(0)} 
	return arr.reduce(function(prevVal, currVal, currIndex, arr){return prevVal+currVal})
}

// Runs an array of functions with the provided argument
// Useful when a list of callback functions need to be run with particular data
function runAll(arr, argument) {
	function run(f) {f(argument)}
	map(run, arr)
}