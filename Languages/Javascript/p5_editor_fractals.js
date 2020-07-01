function setup() {
  createCanvas(400, 400);
}

const c1 = 'black', c2 = 'red';

function dragon(v1, v2, level, col) {
  let diff = p5.Vector.sub(v2, v1);
  diff.mult(0.5);
  let side = diff.copy().rotate(PI/2);
  let midpoint = v1.copy().add(diff).add(side);
  if(level <= 0) {
    fill(col);
    noStroke();
    triangle(v1.x, v1.y, v2.x, v2.y, midpoint.x, midpoint.y);
    // stroke(col);
    //line(v1.x, v1.y, v2.x, v2.y);
    //bezier(v1.x, v1.y, midpoint.x, midpoint.y, 
    //       midpoint.x, midpoint.y, v2.x, v2.y);
  } else {
    dragon(v1, midpoint, level - 1, col);
    dragon(v2, midpoint, level - 1, (col === c1 ? c2 : c1));
  }
}

function sierpinski(top, bot, left, right, level) {
  if(level <= 0) {
    rect(left, top, right, bot);
    return;
  }
  
  const thirdX = (right - left) / 2.5;
  const thirdY = (bot - top) / 2.5;
  sierpinski(top, top + thirdY, left, left + thirdX, level - 1);
  sierpinski(bot - thirdY, bot, left, left + thirdX, level - 1);
  sierpinski(top, top + thirdY, right - thirdX, right, level - 1);
  sierpinski(bot - thirdY, bot, right - thirdX, right, level - 1);
}

function draw() {
  background(220);
  /*
  noFill();
  strokeWeight(2);
  dragon(createVector(130, 100), createVector(width-70, height-100), 11, c1);
  */
  fill(0);
  noStroke();
  rectMode(CORNERS);
  sierpinski(0, height, 0, width, round(millis() / 1000) % 5 + 1);
}