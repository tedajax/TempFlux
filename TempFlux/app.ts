declare var dcodeIO;

var game: Game;
var currTime: number;
var prevTime: number;

window.onload = initialize;

var FPSElement: HTMLElement;
var FPS = 60;
var framesThisSecond = 0;
var lastTick;

function initialize() {
    var canvas = <HTMLCanvasElement>document.getElementById('canvas');
    canvas.addEventListener("contextmenu", (e: MouseEvent) => {
        if (e.button == 2) {
            e.preventDefault();
            return false;
        }
    }, false);
    game = new Game(canvas);

    FPSElement = document.getElementById("fps");

    game.initialize();

    lastTick = performance.now();
    framesThisSecond = 0;

    setTimeout(update, 1000 / FPS);
    requestAnimationFrame(render);
}

function update() {
    prevTime = (currTime != null) ? currTime : performance.now();
    currTime = performance.now();
    var dt = (currTime - prevTime) / 1000.0;
    game.update(dt);

    setTimeout(update, 1000 / FPS);
}

function render() {
    game.render();

    ++framesThisSecond;
    var now = performance.now();
    if (now - lastTick >= 1000) {
        FPSElement.textContent = "FPS: " + framesThisSecond;
        framesThisSecond = 0;
        lastTick = now;
    }

    requestAnimationFrame(render);
}

function loadJsonFile(url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();

    return JSON.parse(request.responseText);
}