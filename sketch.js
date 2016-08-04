// maximum and minimum radius
const MIN_R = 6;
const MAX_R = 36;

// canvas size
const WIDTH  = 640;
const HEIGHT = 360;
const SIZE   = WIDTH * HEIGHT;

// buffer for store ineligible positions of circles
var buffer = new ArrayBuffer(SIZE);
var area   = new Int8Array(buffer);

// chunk size
const CHUNK_SIZE = MAX_R * 2;
const CHUNK_COLS = Math.ceil(WIDTH  / CHUNK_SIZE);
const CHUNK_ROWS = Math.ceil(HEIGHT / CHUNK_SIZE);

var chunks = [];

// count of circles
var count = 0;

// circle obj
function Circle(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;

  this.show = function() {
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
  return random(MIN_R, max);
}

const SQRT = 1 / Math.sqrt(2);
// disallow positions in area under the circle
function reduceArea(circle) {
  var size = round((circle.radius + MIN_R - 1) * SQRT);

  var beginX = circle.x - size;
  if (beginX < 0) {
    beginX = 0;
  }
  var endX = circle.x + size;
  if (endX > WIDTH - 1) {
    endX = WIDTH - 1;
  }
  var beginY = circle.y - size;
  if (beginY < 0) {
    beginY = 0;
  }
  var endY = circle.y + size;
  if (endY > HEIGHT - 1) {
    endY = HEIGHT - 1;
  }

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

  for(i = 0; i < 10000; ++i) {
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
    ++count;

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