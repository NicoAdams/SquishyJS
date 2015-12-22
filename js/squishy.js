// Defines a point

Point = function(pos) {
	this.pos = pos
	this.vel = zeroVector2()
	this.acc = zeroVector2()
	this.mass = 1
}

Point.prototype.getPos = function(){
	return this.pos.copy()
}

Point.prototype.getVel = function(){
	return this.vel.copy()
}

Point.prototype.update = function(dt) {
	this.vel.add(this.acc.copy().scale(dt))
	this.pos.add(this.vel.copy().scale(dt))
	this.acc = zeroVector2()
}

Point.prototype.applyForce = function(fVec) {
	fVec = fVec.copy()
	this.acc.add(fVec.scale(1/this.mass))
}

// Defines a force relation between two points
// f: A function with signature (p1, p2) -> vector2 [force on p1]
Force = function(p1, p2, f) {
	this.p1 = p1
	this.p2 = p2
	this.f = f
	
	this.apply = function() {
		p1.applyForce(this.f(this.p1, this.p2))
		p2.applyForce(this.f(this.p2, this.p1))
	}
}

// Spring force with eq distance eq and spring force k
springForce = function(point1, point2, eq, k, damping) {
	forceFunc = function(point1, point2) {
		pos1 = point1.getPos(); pos2 = point2.getPos();
		vel1 = point1.getVel(); vel2 = point2.getVel();
		
		force = zeroVector2()
		
		// Force 
		currDist = pos1.copy().sub(pos2)
		force.add(currDist.scale(k*(eq-currDist.length())))
		
		// Damping
		
		currVel = vel1.copy().sub(vel2)
		if(currVel.length() != 0) {
			currVelParallel = currVel.copy().project(currDist)
			dampingForce = currVelParallel.scale(-damping)
			force.add(dampingForce)
		}
		return force
	}
	return new Force(point1, point2, forceFunc)
}

// Replusion force given by strength * r^n
radialPowerForce = function(point1, point2, strength, n) {
	forceFunc = function(point1, point2) {
		pos1 = point1.getPos(); pos2 = point2.getPos();
		
		currDist = p1.copy().sub(p2)
		r = currDist.length()
		return currDist.norm().scale(strength * Math.pow(r, n))
	}
	return new Force(point1, point2, forceFunc)
}

// Defines a squishy ball
// kEdge, kCenter are spring constants
// dampEdge, dampCenter are spring damping factors

defaultBallParams = function() {
	return {
		pos: zeroVector2(),
		radius: 10,
		numPoints: 20,
		kEdge: 1,
		kCenter: 1,
		dampEdge: 0,
		dampCenter: 0
	}
}

Ball = function(params) {
	this.radius = params.radius
	
	numPoints = params.numPoints
	
	// Arranges the points in a circle
	this.points = []
	dAngle = Math.PI * 2 / numPoints
	for(var i=0; i<numPoints; i++) {
		angle = i*dAngle
		point = new Point(vector2FromPolar(this.radius, angle).add(params.pos))
		this.points.push(point)
	}
	
	// The center repulsive point
	this.centerPoint = new Point(params.pos)
	
	// Attaches spring forces to all points
	this.forces = []
	for(var i=0; i<numPoints; i++) {
		currPoint = this.points[i]
		currPos = currPoint.getPos()
		nextPoint = this.points[(i+1)%numPoints]
		nextPos = nextPoint.getPos()
		
		// Edge force
		eqDist = currPos.copy().sub(nextPos).length()
		edgeForce = springForce(currPoint, nextPoint, eqDist, params.kEdge, params.dampEdge)
		this.forces.push(edgeForce)
		
		// Center force
		centerForce = springForce(currPoint, this.centerPoint, this.radius, params.kCenter, params.dampCenter)
		this.forces.push(centerForce)
	}
}

Ball.prototype.getPoints = function(){
	positions = []
	for(var i=0; i<this.points.length; i++){
		currPos = this.points[i].getPos()
		positions.push(currPos)
	}
	return positions
}

Ball.prototype.update = function(dt) {
	// Applies forces
	for(var i=0; i<this.forces.length; i++) {
		this.forces[i].apply()
	}
	
	// Updates points
	this.centerPoint.update(dt)
	for(var i=0; i<this.points.length; i++) {
		this.points[i].update(dt)
	}
}

// -- Runs simulation -- 
params = defaultBallParams()
params.pos = zeroVector2()
params.radius = 15
params.numPoints = 30
params.kEdge = 1
params.kCenter = 0.25
params.dampEdge = 0.
params.dampCenter = 0.
b = new Ball(params)

b.points[0].vel = new vector2([10,0])
b.points[2].vel = new vector2([-10,0])

viewport.zoom = 5

// A single step of the physics
dt = 0.05
physicsStep = function() {
  b.update(dt)
}
setInterval(physicsStep, 10);

drawBallMesh = function(b, edgeColor, centerColor) {
	l = b.points.length
	for(var i=0; i<l; i++) {
		currPoint = b.points[i]
		nextPoint = b.points[(i+1)%l]
		
		viewport.drawLine(currPoint.getPos(), nextPoint.getPos(), edgeColor)
		viewport.drawLine(currPoint.getPos(), b.centerPoint.getPos(), centerColor)
	}
}

// A single step of the animation
function renderStep()
{
  // Clears the canvas for new visuals
  viewport.clear()
  
  // Renders
  drawBallMesh(b, "red", "green")
  
  // Initiates the next frame
  window.requestAnimationFrame(renderStep);
}
window.requestAnimationFrame(renderStep);
