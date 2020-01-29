let end_sound
let music
let done_btn
let bomb_btn
let music_btn
const nx = 11
const ny = 11
const pad = 30
const a_source = [0, 0]
const b_source = [10, 0]
const a_targ = [10, 10]
const b_targ = [0, 10]
const nmoves = 4
const nmoves_start = 2
const protect_back = 2
const colour_a = "darkorchid"
const colour_b = "darkturquoise"

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
let scalex
let scaley

function preload() {
  music = loadSound("theme_01.mp3")
  end_sound = loadSound("theygotcha.ogg")
}

function setup() {
  music.loop()
  createCanvas(400, 400);
  colorMode(HSB, 100)
  done_btn = createButton('<h3>Turn done [Enter]</h3>');
  bomb_btn = createButton('<h3>Place bomb (3 moves)</h3>');
  music_btn = createButton('<h3>Toggle music</h3>')
  done_btn.mousePressed(donePressed);
  bomb_btn.mousePressed(bombPressed);
  music_btn.mousePressed(musicPressed);
  scalex = (width - pad * 2) / nx
  scaley = (height - pad * 2) / ny
  restart()
}

function emptyGrid(val) {
  let a = []
  for (let xi = 0; xi < nx; xi++) {
    axi = []
    for (let yi = 0; yi < ny; yi++) {
      axi[yi] = val
    }
    a[xi] = axi
  }
  return (a)
}

function restart() {
  filled = emptyGrid(true)
  for (const [x,y] of [a_source, b_source, a_targ, b_targ]) {
    filled[x][y] = false
  }
  turn = "A"
  movesleft = nmoves_start
  n_more_a = 0
  n_more_b = 0
  moves = []
  past_moves = []
}

function moveid([ix, iy]) {
  return(ix + "," + iy)
}

function is_protected(ix, iy) {
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
  let p = new Set(a)
  return(p.has(moveid([ix,iy])))
}

function drawGrid(g) {
  for (let ix = 0; ix < nx; ix++) {
    for (let iy = 0; iy < ny; iy++) {
      let x = pad + ix * scalex
      let y = pad + iy * scaley
      if (g[ix][iy]) {
        rect(x, y, scalex, scaley)
      }
    }
  }
}

function drawProtectedCell(label, ix, iy) {
  let x = pad + ix * scalex
  let y = pad + iy * scaley
  strokeWeight(4)
  rect(x, y, scalex, scaley)
  textAlign(CENTER, CENTER)
  textSize(20)
  fill("black")
  noStroke()
  text(label, x + scalex/2, y + scaley/2)
}

function draw() {
  background(100)
  if (mode == MODE_END) {
    for (let i = 0; i < height; i++) {
      stroke(sin((i + frameCount)/100) * 50 + 50)
      line(0,i,width,i)
    }
  }
  // draw board
  fill("white")
  noStroke()
  rect(pad,pad,width-2*pad,height-2*pad)
  fill("peru")
  stroke("sienna")
  strokeWeight(2)
  drawGrid(filled)
  noStroke()
  fill("black")
  textSize(20)
  if (mode == MODE_MOVE || mode == MODE_BOMB) {
    // highlight current moves
    for (const [ix, iy] of moves) {
      let x = pad + ix * scalex
      let y = pad + iy * scaley
      noFill()
      stroke(color(100, 0, 0, 100))
      strokeWeight(4)
      rect(x, y, scalex, scaley)
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
  drawProtectedCell("A", a_source[0], a_source[1])
  fill(colour_b)
  stroke("black")
  drawProtectedCell("B", b_source[0], b_source[1])
  // draw targets
  fill(colour_a)
  stroke("black")
  drawProtectedCell("🎯", a_targ[0], a_targ[1])
  fill(colour_b)
  stroke("black")
  drawProtectedCell("🎯", b_targ[0], a_targ[1])
  // draw protected moves
  for (let i = 0; i < protect_back; i++) {
    if (past_moves.length > i) {
      for (let [ix, iy] of past_moves[i]) {
        stroke("black")
        noFill()
        drawProtectedCell(protect_back-i,ix,iy)
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

function mousePressed_move() {
  if (mouseX < pad) return false;
  if (mouseY < pad) return false;
  if (mouseX > width - pad) return false;
  if (mouseY > height - pad) return false;
  let ix = floor((mouseX - pad) / scalex)
  let iy = floor((mouseY - pad) / scaley)
  if (is_protected(ix, iy) == false) {
    let flip = moves.map(moveid).includes(moveid([ix,iy]))
    if (flip || (movesleft > 0)) {
      filled[ix][iy] = !filled[ix][iy]
      if (!flip) {
        moves.push([ix, iy])
        movesleft = movesleft - 1
      }
    }
  }
}

function mousePressed_bomb() {
  if (mouseX < pad) return false;
  if (mouseY < pad) return false;
  if (mouseX > width - pad) return false;
  if (mouseY > height - pad) return false;
  let ix = floor((mouseX - pad) / scalex)
  let iy = floor((mouseY - pad) / scaley)
  bombs[ix][iy] = protect_back
  moves.push([ix, iy])
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

function musicPressed() {
  if (music.isPlaying()) {
    music.stop()
  } else {
    music.loop()
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
  let [sx,sy] = source
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
  if (moveid([x,y]) == moveid(targ))
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