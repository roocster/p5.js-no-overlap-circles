// maximum and minimum radius
const MIN_R = 6;
const MAX_R = 36;

// canvas size
const WIDTH  = 640;
const HEIGHT = 480;
const SIZE   = WIDTH * HEIGHT;

// buffer for store ineligible positions of circles
var buffer = new ArrayBuffer(SIZE);
var area   = new Int8Array(buffer);

// chunk size
const CHUNK_SIZE = MAX_R * 2;
const CHUNK_COLS = Math.ceil(WIDTH  / CHUNK_SIZE);
const CHUNK_ROWS = Math.ceil(HEIGHT / CHUNK_SIZE);

var chunks = [];

// circle obj
function Circle(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;

  this.show = function() {
    fill(random(0, 255));
    ellipse(x, y, radius * 2, radius * 2);
  }
}

// index to coordinate
function getPos(index) {
  return createVector(index % WIDTH, floor(index / WIDTH));
}

// coordinate to index
function getIndex(x, y) {
  return x + y * WIDTH;
}

// select chunk that corresponds to the coordinates
function getChunk(x, y) {
  return {
    col: Math.floor(x / (CHUNK_SIZE)),
    row: Math.floor(y / (CHUNK_SIZE))
  };
}

// select neighbor chunks
function getNeighborChunks(row, col) {
  var result = [];

  result.push(chunks[row][col]);

  if (col > 0) {
    result.push(chunks[row][col - 1]);

    if (row > 0) {
      result.push(chunks[row - 1][col - 1]);
    }
  }
  if (col < CHUNK_COLS - 1) {
    result.push(chunks[row][col + 1]);

    if (row < CHUNK_ROWS - 1) {
      result.push(chunks[row + 1][col + 1]);
    }
  }
  if (row > 0) {
    result.push(chunks[row - 1][col]);

    if (col < CHUNK_COLS - 1) {
      result.push(chunks[row - 1][col + 1]);
    }
  }
  if (row < CHUNK_ROWS - 1) {
    result.push(chunks[row + 1][col]);

    if (col > 0) {
      result.push(chunks[row + 1][col - 1]);
    }
  }

  return result;
}

// random integer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// get random from possible radius of the circle in spicified position
// or return false if the circle can not be placed in this position
function getRadius(x, y) {

  var chunk     = getChunk(x, y);
  var neighbors = getNeighborChunks(chunk.row, chunk.col);

  // distance to nearest circle
  var max = MAX_R;

  // for each circle in neighbors chunks
  for (var i = 0; i < neighbors.length; ++i) {
    for (var j = 0; j < neighbors[i].length; ++j) {

      var circle = neighbors[i][j];
      // distance to the circle edge
      var r = dist(x, y, circle.x, circle.y) - circle.radius;

      if (r < max) {
        max = r;
      }

      if (max < MIN_R) {
        // circle can not be placed in this position
        return false;
      }
    }
  }

  if(max > MAX_R) {
    max = MAX_R;
  }

  // return max;
  // return random(MIN_R, max);
  return constrain(random(MIN_R, MAX_R), MIN_R, max);
}

const SQRT = 1 / Math.sqrt(2);
// disallow positions in area under the circle
function reduceArea(circle) {
  var size = round((circle.radius + MIN_R - 1) * SQRT);

  var beginX = constrain(circle.x - size, 0, WIDTH);
  var beginY = constrain(circle.y - size, 0, HEIGHT);
  var endX   = constrain(circle.x + size, 0, WIDTH);
  var endY   = constrain(circle.y + size, 0, HEIGHT);

  var length = endX - beginX;
  var index  = getIndex(beginX, beginY);
  for (var y = beginY; y <= endY; ++y) {
    area.fill(1, index, index + length);
    index += WIDTH;
  }
}

function setup() {
  createCanvas(WIDTH, HEIGHT);

  stroke('black');
  strokeWeight(1);

  // create chunks
  for (var j = 0; j < CHUNK_ROWS; ++j) {
    chunks[j] = [];
    for (var i = 0; i < CHUNK_COLS; ++i) {
      chunks[j][i] = [];
    }
  }

  for(i = 0; i < 12000; ++i) {
    generate();
  }
}

// generate circles
function generate() {
  var index;
  // get random allowable position
  do {
    index = getRandomInt(0, SIZE);
  } while(area[index] == 1);


  var center = getPos(index);
  var radius = getRadius(center.x, center.y);

  if(radius !== false) {
    var circle = new Circle(center.x, center.y, radius);
    var chunk  = getChunk(center.x, center.y);

    // put a circle in the corresponding chunk
    chunks[chunk.row][chunk.col].push(circle);

    reduceArea(circle);

    circle.show();
  }
  else {
    // because circle cannot be placed in this position
    // let's disallow this for subsequent checks
    area[index] = -1;
  }
}

function draw() {
  // generate();
}