let end_sound
let done_btn
let bomb_btn
const nx = 11
const ny = 11
const pad = 30
const nmoves = 4
const nmoves_start = 2
const protect_back = 2
const colour_a = "darkorchid"
const colour_b = "darkturquoise"

// vectors (created in setup function)
let a_source, b_source, a_targ, b_targ
let padv

const MODE_MOVE = 0
const MODE_BOMB = 1
const MODE_END = 2

let mode = MODE_MOVE
let filled = []
let turn = "A"
let n_more_a = 0
let n_more_b = 0
let movesleft = 0
let moves = []
let past_moves = []
let awin = false
let bwin = false
let scale

function preload() {
  end_sound = loadSound("theygotcha.ogg")
}

function setup() {
  a_source = createVector(0, 0)
  b_source = createVector(nx-1, 0)
  a_targ = createVector(nx-1, ny-1)
  b_targ = createVector(0, ny-1)
  padv = createVector(pad, pad)
  createCanvas(400, 400);
  colorMode(HSB, 100)
  done_btn = createButton('<h3>Turn done [Enter]</h3>');
  bomb_btn = createButton('<h3>Place bomb (3 moves)</h3>');
  done_btn.mousePressed(donePressed);
  bomb_btn.mousePressed(bombPressed);
  scale = (width - pad * 2) / nx
  restart()
}

function emptyGrid(val) {
  let a = []
  for (let xi = 0; xi < nx; xi++) {
    a[xi] = []
    for (let yi = 0; yi < ny; yi++) {
      a[xi][yi] = val
    }
  }
  return (a)
}

function restart() {
  filled = emptyGrid(true)
  for (const v of [a_source, b_source, a_targ, b_targ]) {
    filled[v.x][v.y] = false
  }
  turn = "A"
  movesleft = nmoves_start
  n_more_a = 0
  n_more_b = 0
  moves = []
  past_moves = []
}

function moveid(v) {
  return (v.x + "," + v.y)
}

function is_protected(v) {
  let a = [moveid(a_source),
           moveid(b_source),
           moveid(a_targ),
           moveid(b_targ)]
  for (let i = 0; i < protect_back; i++) {
    if (past_moves.length > i) {
      for (const move of past_moves[i]) {
        a.push(moveid(move))
      }
    }
  }
  return (a.includes(moveid(v)))
}

function toPx(v) {
  let px = p5.Vector.mult(v, scale)
  px.add(padv)
  return px
}

function drawGrid(g) {
  for (let ix = 0; ix < nx; ix++) {
    for (let iy = 0; iy < ny; iy++) {
      let x = pad + ix * scale
      let y = pad + iy * scale
      if (g[ix][iy]) {
        rect(x, y, scale, scale)
      }
    }
  }
}

function drawProtectedCell(label, v) {
  let px = toPx(v)
  strokeWeight(4)
  rect(px.x, px.y, scale, scale)
  textAlign(CENTER, CENTER)
  textSize(20)
  fill("black")
  noStroke()
  text(label, px.x + scale / 2, px.y + scale / 2)
}

function draw() {
  background(100)
  if (mode == MODE_END) {
    for (let i = 0; i < height; i++) {
      stroke(sin((i + frameCount) / 100) * 50 + 50)
      line(0, i, width, i)
    }
  }
  // draw board
  fill("white")
  noStroke()
  rect(pad, pad, width - 2 * pad, height - 2 * pad)
  fill("peru")
  stroke("sienna")
  strokeWeight(2)
  drawGrid(filled)
  noStroke()
  fill("black")
  textSize(20)
  if (mode == MODE_MOVE || mode == MODE_BOMB) {
    // highlight current moves
    for (const v of moves) {
      let px = toPx(v)
      noFill()
      stroke(color(100, 0, 0, 100))
      strokeWeight(4)
      rect(px.x, px.y, scale, scale)
      strokeWeight(1)
    }
    fill("black")
    noStroke()
    textAlign(LEFT, BASELINE)
    text("Player " + turn, width / 4, 25)
    text(movesleft + " moves left", width / 2, 25)
  }
  if (mode == MODE_END) {
    textAlign(LEFT, BASELINE)
    text("Player " + turn + " wins!", width / 4, 25)
    // draw winning path(s)
    if (awin) {
      noStroke()
      fill(colour_a)
      drawGrid(awin)
    }
    if (bwin) {
      noStroke()
      fill(colour_b)
      drawGrid(bwin)
    }
  }
  // draw sources
  fill(colour_a)
  stroke("black")
  drawProtectedCell("A", a_source)
  fill(colour_b)
  stroke("black")
  drawProtectedCell("B", b_source)
  // draw targets
  fill(colour_a)
  stroke("black")
  drawProtectedCell("🎯", a_targ)
  fill(colour_b)
  stroke("black")
  drawProtectedCell("🎯", b_targ)
  // draw protected moves
  for (let i = 0; i < protect_back; i++) {
    if (past_moves.length > i) {
      for (let v of past_moves[i]) {
        stroke("black")
        noFill()
        drawProtectedCell(protect_back - i, v)
      }
    }
  }
}

function mousePressed() {
  if (mode == MODE_MOVE) {
    mousePressed_move()
  }
  if (mode == MODE_BOMB) {
    mousePressed_bomb()
  }
}

function clickedCell() {
  if (mouseX < pad) return false;
  if (mouseY < pad) return false;
  if (mouseX > width - pad) return false;
  if (mouseY > height - pad) return false;
  let ix = floor((mouseX - pad) / scale)
  let iy = floor((mouseY - pad) / scale)
  return createVector(ix, iy)
}

function mousePressed_move() {
  let v = clickedCell()
  if (!v) return
  let ix = v.x
  let iy = v.y
  if (is_protected(v) == false) {
    let flip = moves.map(moveid).includes(moveid(v))
    if (flip || (movesleft > 0)) {
      filled[ix][iy] = !filled[ix][iy]
      if (!flip) {
        moves.push(v)
        movesleft = movesleft - 1
      }
    }
  }
}

function mousePressed_bomb() {
  // TODO
}

function donePressed() {
  awin = checkWin(a_source, a_targ)
  bwin = checkWin(b_source, b_targ)
  if (awin && bwin) {
    awin = false
    bwin = false
  }
  if (awin || bwin) {
    mode = MODE_END
    end_sound.play()
  } else {
    mode = MODE_MOVE
    past_moves.unshift(moves)
    turn = (turn == "A") ? "B" : "A"
    moves = []
    movesleft = nmoves
  }
}

function keyPressed() {
  if (keyCode == ENTER) {
    donePressed()
  }
}

function bombPressed() {
  if (mode == MODE_MOVE) {
    mode = MODE_BOMB
  } else if (mode == MODE_BOMB) {
    mode = MODE_MOVE
  }
}

function checkWin(source, targ) {
  let sx = source.x
  let sy = source.y
  let path = DFS(sx, sy, emptyGrid(false), targ)
  if (path) {
    path[sx][sy] = true
    return (path)
  } else {
    return (false)
  }
}

function DFS(x, y, visited, targ) {
  if (x >= nx || y >= ny)
    return (false)
  if (x < 0 || y < 0)
    return (false)
  if (visited[x][y])
    return (false)
  if (filled[x][y] == true)
    return (false)
  visited[x][y] = true
  if (moveid(createVector(x, y)) == moveid(targ))
    return (visited)
  let ans =
    DFS(x + 1, y + 1, visited, targ) ||
    DFS(x + 1, y, visited, targ) ||
    DFS(x, y + 1, visited, targ) ||
    DFS(x + 1, y - 1, visited, targ) ||
    DFS(x - 1, y + 1, visited, targ) ||
    DFS(x, y - 1, visited, targ) ||
    DFS(x - 1, y, visited, targ) ||
    DFS(x - 1, y - 1, visited, targ)
  return (ans)
}