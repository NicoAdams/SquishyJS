// -- Viewport --

viewport = {}

canvas = $( "#space" )[0];
canvasCtx = canvas.getContext('2d');

viewport.zoom = 1;

// gameCenter: The coordinate of reference in the game
viewport.gameCenter = zeroVector2();

// screenCenter: The center coordinate of the canvas
// Will be determined and set automatically
viewport.screenCenter = zeroVector2();

viewport.setCenter = function(center){
  viewport.gameCenter = center.copy()
}

viewport.setZoom = function(zoom){
  viewport.zoom = zoom
}

viewport.gameToAbs = function(gameVec){
  absVec = gameVec.copy()
  absVec.sub(this.gameCenter)
  absVec.elementMul(new vector2([1,-1]))
  absVec.scale(viewport.zoom)
  absVec.add(this.screenCenter)
  return absVec
}

viewport.absToGame = function(absVec){
  gameVec = absVec.copy()
  gameVec.sub(this.screenCenter)
  gameVec.scale(1/viewport.zoom)
  gameVec.elementMul(new vector2([1,-1]))
  gameVec.add(this.gameCenter)
  return gameVec
}

// Returns vectors v(xMin, yMin), v(xMax, yMax) in game coords
// Signature: [vMin, vMax]
viewport.gameBounds = function() {
  absMin = new vector2([0, 0])
  absMax = new vector2([canvas.width, canvas.height])
  gameMin = viewport.absToGame(absMin)
  gameMax = viewport.absToGame(absMax)
  return [gameMin, gameMax]
}

viewport.getShapeAbsPoints = function(s) {
  points = s.getPoints()
  for(var i=0; i<points.length; i++) {
    points[i] = viewport.gameToAbs(points[i])
  }
  return points
}

viewport.clear = function(){
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

viewport.stroke = function(c){
  canvasCtx.strokeStyle = c
  canvasCtx.stroke()
}

viewport.fill = function(c){
  canvasCtx.fillStyle = c
  canvasCtx.fill()
}

viewport.drawCircle = function(p, r, c){
  // Circle at position p with radius r and color c
  p = viewport.gameToAbs(p)
  
  canvasCtx.beginPath();
  canvasCtx.arc(p.x(), p.y(), r, 0, 2 * Math.PI, false);
  
  viewport.stroke(c)
}

viewport.fillCircle = function(p, r, c){
  // Circle at position p with radius r and color c
  p = viewport.gameToAbs(p)
  r = r*zoom
  
  canvasCtx.beginPath();
  canvasCtx.arc(p.x(), p.y(),r, 0, 2 * Math.PI, false);
  
  viewport.fill(c)
},

viewport.drawLine = function(v1, v2, c){
  v1 = viewport.gameToAbs(v1.copy())
  v2 = viewport.gameToAbs(v2.copy())
  
  canvasCtx.beginPath();
  canvasCtx.moveTo(v1.x(),v1.y());
  canvasCtx.lineTo(v2.x(),v2.y());
  
  viewport.stroke(c);
}

viewport.drawShape = function(s, c){
  points = viewport.getShapeAbsPoints(s)
  l = points.length
  
  v0 = points[0]
  canvasCtx.beginPath();
  canvasCtx.moveTo(v0.x(), v0.y())
  canvasCtx.strokeStyle = c
  for(var i=0; i<l; i++) {
    v1 = points[(i+1)%l]
    canvasCtx.lineTo(v1.x(),v1.y());
    canvasCtx.stroke();
  }
}
  
viewport.fillShape = function(s, c){
  points = viewport.getShapeAbsPoints(s)
  l = points.length
  
  v0 = points[0]
  canvasCtx.beginPath();
  canvasCtx.moveTo(v0.x(), v0.y())
  canvasCtx.strokeStyle = c
  for(var i=0; i<l; i++) {
    v1 = points[(i+1)%l]
    canvasCtx.lineTo(v1.x(),v1.y());
  }
  canvasCtx.closePath();
  canvasCtx.fillStyle = c;
  canvasCtx.fill();
}

// -- Utility functions --

setCanvasSize = function() {
  w = $( window ).width();
  h = $( window ).height();
  viewport.screenCenter = new vector2([w/2,h/2]);
  canvas.width  = w
  canvas.height = h
};
window.onresize = setCanvasSize
setCanvasSize()

// Creates an rgb color string from arguments r, g, b
function rgb(r, g, b) {
  return "rgb("+r+","+g+","+b+")"
}

// Creates an hsl color string from arguments h, s, l
function hsl(h, s, l) {
  return "hsl("+h+","+s+"%,"+l+"%)"
}
