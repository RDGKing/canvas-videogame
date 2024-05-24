const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let canvasWidth = 700;
let canvasHeight = 400;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const audio = new Audio('music\\music.mp3'); // Reemplaza esto con la ruta a tu archivo de audio
audio.loop = true; // Hacer que el audio se repita
audio.volume = 0.5; // Ajustar el volumen (opcional)


var imagen = new Image();
imagen.src = 'images/background.png'; // Reemplaza esto con la ruta a tu imagen de fondo

let score = 0;
let lifes = 3;

const lifesElement = document.getElementById('lifes');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOverMessage');


/////////////////////CLASE CIRCULO//////////////////////////
class Circle {
    constructor(x, y, radius, speed, imageUrl) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.speed = speed;
        this.dx = 1 * this.speed;
        this.dy = -1 * this.speed; // Cambiar a dirección hacia arriba
        this.imageUrl = imageUrl; // Esta línea es la correcta
        this.collisionOccurred = false; // Nueva propiedad para controlar si ya ocurrió una colisión

        // Cargar la imagen
        this.image = new Image();
        this.image.src = imageUrl;
    }

    draw(context) {
        context.drawImage(this.image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.closePath();
    }

    update(context) {
        this.draw(context);

        if ((this.posX + this.radius) > canvasWidth) {
            this.dx = -this.dx;
        }

        if ((this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        if (this.posY + this.radius >= canvasHeight) {
            this.dy = -Math.abs(this.dy);
        }

        if (this.posY - this.radius * -2 <= 0) {
            // Eliminar el círculo del array si sobrepasa la parte superior del canvas
            let index = arrayCircle.indexOf(this);
            if (index > -1) {
                arrayCircle.splice(index, 1);
            }
            if (this.imageUrl == 'images\\Extralife.png') {
                score--; // Incrementar el puntaje
                scoreElement.textContent = `Score: ${score}`; // Actualizar el marcador
            } else {
                score++; // Incrementar el puntaje
                scoreElement.textContent = `Score: ${score}`; // Actualizar el marcador
            }
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }
}
//////////////////CLASE CIRCULO///////////////////

/////// Función para obtener la distancia entre dos puntos//////////
function getDistance(posX1, posY1, posX2, posY2) {
    return Math.sqrt(Math.pow((posX2 - posX1), 2) + Math.pow((posY2 - posY1), 2));
}
/////// Función para obtener la distancia entre dos puntos//////////

/////////////////CREA CIRCULOS////////////////////
let arrayCircle = [];
function createCircle() {
    let randomR = Math.floor(Math.random() * 42 + 14);
    let randomX, randomY;
    do {
        randomX = Math.random() * (canvasWidth - randomR * 2) + randomR;
        randomY = canvasHeight + Math.random() * (canvasHeight - randomR * 2) + randomR;
    } while (checkOverlap(randomX, randomY, randomR));
    let imageUrl = ['images\\atack.png', 'images\\atack2.png', 'images\\atack3.png', 'images\\Extralife.png'];
    const circulo = Math.floor(Math.random() * imageUrl.length);
   // if(circulo == )
    let randomS = Math.floor(Math.random() * 8 + 1);
    let miCirculo = new Circle(randomX, randomY, randomR, randomS, imageUrl[circulo]);

    arrayCircle.push(miCirculo);
}
let circlesCreated = 0;
let Delay = 2000;
let createCirclesTimeout; // Variable para almacenar el identificador del temporizador

function createCircles() {
    function generateCircleWithDelay(currentDelay) {
        createCircle();
        circlesCreated++;

        if (Delay > 500) {
            Delay -= 100;
        } else if (Delay <= 300 && Delay !== 150) {
            Delay -= 1;
        }

        console.log(`${Delay} ${circlesCreated}`);

        createCirclesTimeout = setTimeout(() => generateCircleWithDelay(Delay), currentDelay); // Asignar setTimeout a createCirclesTimeout
    }

    generateCircleWithDelay(Delay);
}
/////////////////CREA CIRCULOS////////////////////

/////////////Controla superposicion al crear circulos///////////////
function checkOverlap(x, y, radius) {
    for (let i = 0; i < arrayCircle.length; i++) {
        let circle = arrayCircle[i];
        let distance = getDistance(x, y, circle.posX, circle.posY);
        if (distance <= radius + circle.radius) {
            return true;
        }
    }
    return false;
}
/////////////Controla superposicion al crear circulos///////////////

//////////REBOTE DE CIRCULOS/////////////
function updateCircles() {
    arrayCircle.forEach(circle => {
        circle.update(ctx);

        arrayCircle.forEach(circletwo => {
            if (circle !== circletwo && getDistance(circle.posX, circle.posY, circletwo.posX, circletwo.posY) <= (circle.radius + circletwo.radius)) {
                let angulo = Math.atan2(circletwo.posY - circle.posY, circletwo.posX - circle.posX);
                let PosNewX = Math.cos(angulo);
                let PosNewY = Math.sin(angulo);

                circle.dx = circle.speed * -PosNewX;
                circle.dy = circle.speed * -PosNewY;
                circletwo.dx = circletwo.speed * PosNewX;
                circletwo.dy = circletwo.speed * PosNewY;
            }
        });
    });
    arrayCircle.forEach(circle => {
        let dx = mouse.posX - circle.posX;
        let dy = mouse.posY - circle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < circle.radius + mouse.size / 2) {

            if (circle.collisionOccurred == false) {

                if (circle.imageUrl == 'images\\Extralife.png') {
                    lifes = lifes + 1;
                    lifesElement.textContent = `Lifes: ${lifes}`; // Actualizar el marcador
                    circle.collisionOccurred = true;
                } else {
                    score--; // Incrementar el puntaje
                    scoreElement.textContent = `Score: ${score}`; // Actualizar el marcador
                    lifes = lifes - 1;
                    lifesElement.textContent = `Lifes: ${lifes}`; // Actualizar el marcador
                    circle.collisionOccurred = true;
                }
                let index = arrayCircle.indexOf(circle);
                if (index > -1) {
                    arrayCircle.splice(index, 1);
                }
            }
        }
    });

}
//////////REBOTE DE CIRCULOS/////////////

////CREA PUNTERO///


class Mouse {
    constructor(size, imageUrl) {
        this.size = size;
        this.posX = 0;
        this.posY = 0;
        this.imageUrl = imageUrl;

        this.image = new Image();
        this.image.src = imageUrl;
    }

    draw(context) {
        // Dibuja la imagen del cursor en lugar de un cuadrado
        context.drawImage(this.image, this.posX - this.size / 2, this.posY - this.size / 2, this.size, this.size);
    }

    updatePosition(x, y) {
        this.posX = x;
        this.posY = y;
    }
}

let cursor = 'images/cohete-espacial.png';
const mouse = new Mouse(32, cursor); // Tamaño del cuadrado y color

canvas.addEventListener('mousemove', function (event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    mouse.updatePosition(mouseX, mouseY);
});


/////////////////////////
function updateCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(imagen, 0, 0, canvasWidth, canvasHeight); // Dibujar la imagen de fondo nuevamente
    if (lifes > 0) {
        updateCircles();
    } else {
        clearTimeout(createCirclesTimeout);
        gameOverElement.style.display = 'block'; // O 'inline', 'inline-block', dependiendo del tipo de elemento
    }
    mouse.draw(ctx); // Dibujar el cuadrado que sigue al mouse
    requestAnimationFrame(updateCanvas);
}
updateCanvas();
/////////////////////////

//////////////BOTON START/////////////
document.getElementById('startButton').addEventListener('click', function () {
    this.style.display = 'none';
    audio.play(); // Reproducir el audio cuando comience el juego
    createCircles();
    updateCanvas();
});
