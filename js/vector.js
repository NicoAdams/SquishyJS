// -- Defines vector objects --

// N-D vector

function vector (vals) {
  this.vals = vals
}

// Returns a copy of the vector's vals
vector.prototype.getVals = function(){return this.vals.slice()}

// Returns a copy of the vector
vector.prototype.copy = function(){return new vector(this.getVals())}

vector.prototype.dim = function(){return this.vals.length}

vector.prototype.assertSameDim = function(v){
  assertEq(this.dim(), v.dim(), "Vector dimensions must match")
}

vector.prototype.length = function(){
  l = 0
  for(var i=0; i<this.vals.length; i++) {
    l += Math.pow(this.vals[i],2)
  }
  return Math.sqrt(l)
}

vector.prototype.scalarAdd = function(n)
{
  this.vals = map(function(x){return x+n}, this.vals)
  return this
}

vector.prototype.scale = function(n)
{
  this.vals = map(function(x){return x*n}, this.vals)
  return this
}

vector.prototype.add = function(v) {
  this.assertSameDim(v)
  addElement = function(x,y){return x+y}
  this.vals = join(addElement, this.vals, v.vals)
  return this
};

vector.prototype.sub = function(v)
{
  this.assertSameDim(v)
  
  subtractElement = function(x,y){return x-y}
  this.vals = join(subtractElement, this.vals, v.vals)
  return this
};

vector.prototype.elementMul = function(v)
{
  this.assertSameDim(v)
  
  for(var i=0; i<this.vals.length; i++) {
    this.vals[i] *= v.vals[i]
  }
  return this
};

vector.prototype.dot = function(v)
{
  this.assertSameDim(v)
  result = 0
  for(var i=0; i<this.vals.length; i++) {
    result += this.vals[i] * v.vals[i]
  }
  return result
};

vector.prototype.norm = function()
{
  currLen = this.length()
  if(currLen != 0){
    this.scale(1/this.length());    
  }
  return this
};

// Projects this onto the v direction
vector.prototype.project = function(v)
{
  this.assertSameDim(v)
  
  vn = v.norm()
  scaleFactor = this.dot(vn)
  this.vals = vn.scale(this.dot(vn)).vals
  return this
};

vector.prototype.limit = function(maxMag)
{
  if(maxMag < 0) {
    throw "maxMag must be a nonnegative number"
  }
  // Limits the length of this to maxMag
  currMag = this.length()
  if(currMag != 0 && currMag > maxMag) {
    return this.scale(maxMag/currMag);
  }
  return this;
};

// 2-D vector

vector2 = function(vals) {
  assertEq(vals.length, 2, "vector2 requires 2 values")
  this.vals = vals
}
extend(vector, vector2)

// Typecasting
vector.prototype.to2 = function() {
  v2 = new vector2([0,0])
  this.assertSameDim(v2)
  v2.vals = this.vals
}

vector2.prototype.copy = function(){
  return new vector2(this.getVals())
}

vector2.prototype.x = function(){return this.vals[0]}
vector2.prototype.y = function(){return this.vals[1]}

vector2.prototype.scalarCross = function(v){
  return this.x()*v.y() - this.y()*v.x();
}

vector2.prototype.angle = function() {
  return Math.atan2(this.y(), this.x())
};

// Constructs a new vector from polar coordinates
function vector2FromPolar(mag, angle) {
  return new vector2([mag*Math.cos(angle), mag*Math.sin(angle)])
}

vector2.prototype.rotate = function(angle)
{
  v = vector2FromPolar(this.length(), this.angle() + angle)
  this.vals = v.vals
  return this
}

vector2.prototype.rotateAbout = function(angle, origin)
{
  this.sub(origin)
  this.rotate(angle)
  this.add(origin)
  return this
}

// Constructors

function randomVector2() {
  return vector2FromPolar(Math.random(), 2*Math.PI*Math.random())
}

function zeroVector(dim)
{
  vals = new Array(dim).fill(0)
  return new vector(vals)
}

function zeroVector2()
{
  return new vector2([0,0])
}

