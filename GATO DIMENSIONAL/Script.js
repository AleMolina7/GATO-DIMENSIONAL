//****** GAME LOOP ********//
let time = new Date();
let deltaTime = 0;

if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(Init, 1);
} else {
    document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** VARIABLES GLOBALES ********//
const sueloY = 22;
let velY = 0;
const impulso = 750;
const gravedad = 2500;

const gatoPosX = 42;
let gatoPosY = sueloY;

let sueloX = 0;
let velEscenario = 1280 / 3;
let gameVel = 1;
let score = 0;

let parado = false;
let saltando = false;

let tiempoHastaObstaculo = 1;
const tiempoObstaculoMin = 0.5;
const tiempoObstaculoMax = 1.6;
const obstaculoPosY = 16;
let obstaculos = [];

let tiempoHastaNube = 0.5;
const tiempoNubeMin = 0.7;
const tiempoNubeMax = 2.7;
const maxNubeY = 270;
const minNubeY = 100;
let nubes = [];
const velNube = 0.5;

let contenedor, gato, textoScore, suelo, gameOver;

const miauAudio = document.getElementById("miau");
const fondoAudio = document.getElementById("fondo");

function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    gato = document.querySelector(".gato");

    const mensajeInicio = document.getElementById("inicio");
    mensajeInicio.style.display = "block";
    parado = true;

    mensajeInicio.addEventListener("click", () => {
        mensajeInicio.style.display = "none";
        parado = false;
        miauAudio.currentTime = 0;
        miauAudio.play();
        if (fondoAudio) {
            fondoAudio.currentTime = 0;
            fondoAudio.play();
        }
    });

    document.addEventListener("keydown", HandleKeyDown);
}

function Update() {
    if (parado) return;

    MoverGato();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev) {
    if (ev.keyCode === 32) {
        if (parado) ReiniciarJuego();
        else Saltar();
    }
}

function Saltar() {
    if (gatoPosY === sueloY) {
        saltando = true;
        velY = impulso;
        gato.classList.remove("gato-corriendo");
    }
}

function MoverGato() {
    gatoPosY += velY * deltaTime;
    if (gatoPosY < sueloY) TocarSuelo();
    gato.style.bottom = gatoPosY + "px";
}

function TocarSuelo() {
    gatoPosY = sueloY;
    velY = 0;
    if (saltando) gato.classList.add("gato-corriendo");
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
    gato.classList.remove("gato-corriendo");
    gato.classList.add("gato-estrellado");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if (tiempoHastaObstaculo <= 0) CrearObstaculo();
}

function CrearObstaculo() {
    // Si el score es suficiente, crear el portal final
    if (score >= 100 && !document.querySelector('.portal')) {
        const portal = document.createElement("div");
        portal.classList.add("portal");
        portal.style.width = "80px";
        portal.style.height = "120px";
        portal.style.bottom = sueloY + "px";
        portal.posX = contenedor.clientWidth;
        portal.style.left = contenedor.clientWidth + "px";
        contenedor.appendChild(portal);
        obstaculos.push(portal);
        return;
    }

    const obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);

    const tipo = Math.random();
    if (tipo < 0.4) {
        obstaculo.classList.add("nubevil");
        obstaculo.style.width = "85px";
        obstaculo.style.height = "68px";
        obstaculo.style.bottom = sueloY + "px";
    } else if (tipo < 0.5) {
        obstaculo.classList.add("fuego");
        obstaculo.style.width = "94px";
        obstaculo.style.height = "92px";
        obstaculo.style.bottom = sueloY + "px";
    } else {
        obstaculo.classList.add("ave");
        obstaculo.style.bottom = "80px";
        obstaculo.style.width = "49px";

        // Añadir clase para animación de morder
        obstaculo.classList.add('ave-muerde');

        // Opcional: quitar la clase después de la animación para poder repetirla
        setTimeout(() => {
            obstaculo.classList.remove('ave-muerde');
        }, 1000);
    }

    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth + "px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel;
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if (tiempoHastaNube <= 0) CrearNube();
}

function CrearNube() {
    const nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";

    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}

function MoverObstaculos() {
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        } else {
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX + "px";
        }
    }
}

function MoverNubes() {
    for (let i = nubes.length - 1; i >= 0; i--) {
        if (nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        } else {
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX + "px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = `${score} 🧶`;

    // Cambios de velocidad y fondo más suaves
    if (score === 20) {
        gameVel = 1.3;
        contenedor.classList.add("mediodia");
    } else if (score === 35) {
        gameVel = 1.6;
        contenedor.classList.add("tarde");
    } else if (score === 50) {
        gameVel = 2.0;
        contenedor.classList.add("noche");
    } else if (score === 65) {
        gameVel = 2.5;
    } else if (score === 80) {
        gameVel = 3.0;
    }
    suelo.style.animationDuration = (3 / gameVel) + "s";
}

function GameOver() {
    Estrellarse();
    gameOver.innerHTML = `Buen intento vuelve en el tiempo para lograrlo.<br>Score final: ${score} 🧶<br><small>Presiona space para reiniciar</small>`;
    gameOver.style.display = "block";
    if (fondoAudio) fondoAudio.pause();

    // Reproducir sonido de estrellarse
    const estrellarseAudio = document.getElementById("estrellarse");
    if (estrellarseAudio) {
        estrellarseAudio.currentTime = 0;
        estrellarseAudio.play();
    }
}

function DetectarColision() {
    for (let i = 0; i < obstaculos.length; i++) {
        if (obstaculos[i].posX > gatoPosX + gato.clientWidth) break;
        else {
            if (obstaculos[i].classList.contains('portal')) {
                Felicitaciones();
                return;
            }
            if (IsCollision(gato, obstaculos[i], 10, 30, 15, 20)) {
                if (obstaculos[i].classList.contains('ave')) {
                    obstaculos[i].classList.add('ave-muerde');
                    setTimeout(() => {
                        obstaculos[i].classList.remove('ave-muerde');
                    }, 400); // Duración de la animación
                }
                GameOver();
            }
        }
    }
}

function Felicitaciones() {
    parado = true;
    gato.classList.add("gato-felicitaciones");
    gameOver.innerHTML = `¡Felicitaciones!<br>¡Has llegado a casa!<br>Score final: ${score} 🧶`;
    gameOver.style.display = "block";
    if (fondoAudio) fondoAudio.pause();

    // Reproducir sonido de victoria
    const victoriaAudio = document.getElementById("victoria");
    if (victoriaAudio) {
        victoriaAudio.currentTime = 0;
        victoriaAudio.play();
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return !(
        (aRect.top + aRect.height - paddingBottom) < (bRect.top) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        (aRect.left + aRect.width - paddingRight) < bRect.left ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

function ReiniciarJuego() {
    const restartAudio = document.getElementById("restart");
    if (restartAudio) {
        restartAudio.currentTime = 0;
        restartAudio.play();
    }
    setTimeout(() => {
        location.reload();
    }, 2000); // Espera 400ms para que suene el audio antes de recargar
}
// O al hacer clic para empezar
document.getElementById('inicio').addEventListener('click', function() {
  document.getElementById('miau').play();
  // ...lógica de inicio...
});
