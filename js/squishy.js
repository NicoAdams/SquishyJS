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

// Spring force with eq distance eq and spring force k
springForce = function(eq, k) {
  forceFunc = function(point1, point2) {
    pos1 = point1.getPos(); pos2 = point2.getPos();
    
    currDist = pos1.copy().sub(pos2)
    force = currDist.copy().norm()
    
    force.scale(k*(eq-currDist.length()))
    
    return force
  }
  return forceFunc
}

// Replusion force given by strength * r^n
radialPowerForce = function(strength, n) {
  forceFunc = function(point1, point2) {
    pos1 = point1.getPos(); pos2 = point2.getPos();
    
    currDist = pos1.copy().sub(pos2)
    r = currDist.length()
    return currDist.norm().scale(strength * Math.pow(r, n))
  }
  return forceFunc
}

// Damping force
dampingForce = function(damping) {
  forceFunc = function(point1, point2) {
    vel1 = point1.getVel(); vel2 = point2.getVel();
    
    currVel = vel1.copy().sub(vel2)
    force = zeroVector2()
    
    if(currVel.length() != 0) {
      currVelParallel = currVel.copy().project(currDist)
      dampingForce = currVelParallel.scale(-damping)
      force.add(dampingForce)
    }
    return force
  }
  return forceFunc
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
    dampCenter: 0,
    posAveraged: false,
    velAveraged: false
  }
}

Ball = function(params) {
  // Stores relevant params
  this.radius = params.radius
  this.posAveraged = params.posAveraged
  this.velAveraged = params.velAveraged
  
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
  this.centerPoint = new Point(params.pos.copy())
  
  // Assigns an index to the ball's center point
  this.centerPointIndex = function() {return -1}
  
  // Adds a force connection to the ball
  this.addForce = function(i1, i2, f) {
    this.forces.push({
      index1: i1,
      index2: i2,
      force: f
    })
  }
  
  // Attaches spring forces to all points
  this.forces = []
  for(var i=0; i<numPoints; i++) {
    currIndex = i
    nextIndex = (i+1)%numPoints
    currPoint = this.points[currIndex]
    currPos = currPoint.getPos()
    nextPoint = this.points[nextIndex]
    nextPos = nextPoint.getPos()
    
    // Edge forces
    
    eqDist = currPos.copy().sub(nextPos).length()
    edgeForce = springForce(eqDist, params.kEdge)
    this.addForce(currIndex, nextIndex, edgeForce)
    
    edgeDampingForce = dampingForce(params.dampEdge)
    this.addForce(currIndex, nextIndex, edgeDampingForce)
    
    // Center forces
    
    centerForce = springForce(this.radius, params.kCenter)
    this.addForce(currIndex, this.centerPointIndex(), centerForce)
    
    centerDampingForce = dampingForce(params.dampCenter)
    this.addForce(currIndex, this.centerPointIndex(), centerDampingForce)
  }
}

// Returns a list of all points
// Points are copied
Ball.prototype.getPoints = function(){
  positions = []
  for(var i=0; i<this.points.length; i++){
    currPos = this.points[i].getPos()
    positions.push(currPos)
  }
  return positions
}

// Accesses points via index
// Points are not copied
Ball.prototype.pointAt = function(index) {
  if(index == this.centerPointIndex()) {
    return this.centerPoint
  }
  return this.points[index]
}

// Applies a force on all points from an outside source
Ball.prototype.applyExternalForce = function(f) {
  this.centerPoint.applyForce(f(this.centerPoint))
  for(var i=0; i<this.points.length; i++) {
    currPoint = this.points[i]
    currPoint.applyForce(f(currPoint))
  }
}

// Applies a force function between two points stored as {p1Index, p2Index, forceObject}
Ball.prototype.applyInternalForce = function(f, point1, point2) {
  point1.applyForce(f(point1, point2))
  point2.applyForce(f(point2, point1))
}

// Updates the ball
Ball.prototype.update = function(dt) {
  // Applies forces
  for(var i=0; i<this.forces.length; i++) {
    currForce = this.forces[i]
    
    forceFunc = currForce.force
    point1 = this.pointAt(currForce.index1)
    point2 = this.pointAt(currForce.index2)
    this.applyInternalForce(forceFunc, point1, point2)
  }
  
  // Sets center point's position to the average edge position
  if(this.posAveraged) {
    avgPos = zeroVector2()
    for(var i=0; i<this.points.length; i++) {
      avgPos.add(this.points[i].getPos())
    }
    avgPos.scale(1/this.points.length)
    
    this.centerPoint = new Point(avgPos)
  }
  
  // Sets center point's velocity to the average edge velocity
  if(this.velAveraged) {
    avgVel = zeroVector2()
    for(var i=0; i<this.points.length; i++) {
      avgVel.add(this.points[i].getVel())
    }
    avgVel.scale(1/this.points.length)
    
    this.centerPoint.vel = avgVel
  }
  
  // Updates central point if dynamic
  if(!(this.posAveraged || this.velAveraged)) {
    this.centerPoint.update(dt)
  }
  
  // Updates edge points
  for(var i=0; i<this.points.length; i++) {
    this.points[i].update(dt)
  }
}

// Defines a world: Stores balls, static object and ambient forces (ie gravity



// -- Runs simulation -- 

params = defaultBallParams()
params.pos = zeroVector2()
params.radius = 15
params.numPoints = 25
params.kEdge = 15
params.kCenter = 5
params.dampEdge = 0.2
params.dampCenter = 0.2

// Creates some test balls

params1 = copyObject(params)
params1.pos = params.pos.copy()
params2 = copyObject(params)
params2.pos = params.pos.copy()
params3 = copyObject(params)
params3.pos = params.pos.copy()

balls = []
spacingVec = vector2FromPolar(2.5*params.radius, 0)

params1.pos.sub(spacingVec)
b1 = new Ball(params1)
balls.push(b1)

params2.posAveraged = true
b2 = new Ball(params2)
balls.push(b2)

params3.posAveraged = true
params3.velAveraged = true
params3.pos.add(spacingVec)
b3 = new Ball(params3)
balls.push(b3)

// Perturbs the test balls

function perturbBall(b) {
  b.points[0].vel = new vector2([10,0])
  b.points[Math.round(2)].vel = new vector2([-10,0])
}
for(var i=0; i<balls.length; i++) {
  perturbBall(balls[i])
}

// Sets up the viewport

viewport.setZoom(5)

// A single step of the physics
dt = 0.05
physicsStep = function() {
  for(var i=0; i<balls.length; i++) {
    balls[i].update(dt)
  }
}
// timeStep = 10
timeStep = 10
setInterval(physicsStep, timeStep);

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
  for(var i=0; i<balls.length; i++) {
    viewport.fillShape(balls[i], "gray")
    // drawBallMesh(balls[i], "white", "green")
  }
  
  // Initiates the next frame
  window.requestAnimationFrame(renderStep);
}
window.requestAnimationFrame(renderStep);
