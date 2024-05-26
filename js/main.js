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

let score = 600;
let lifes = 3;
let puntaje = 0;

let enemy = false;
let gameOverFlag = false; // Bandera para controlar la operación de puntaje al perder
let gameWinFlag = false; // Bandera para controlar la operación de puntaje al ganar


const puntajeElement = document.getElementById('puntaje');
const lifesElement = document.getElementById('lifes');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOverMessage');
const gameWinElement = document.getElementById('gameWinMessage');
const maxScoreElement = document.getElementById('maxScore');

/////////////////////CLASE CIRCULO//////////////////////////
class Circle {
    constructor(x, y, radius, speed, imageUrl) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.speed = speed;
        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed; // Cambiar a dirección hacia arriba
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

        if (this.posY - this.radius <= 0) {
            this.dy = +Math.abs(this.dy);
        }

        if (this.posY + this.radius * -2 >= canvasHeight) {
            // Eliminar el círculo del array si sobrepasa la parte superior del canvas
            let index = arrayCircle.indexOf(this);
            if (index > -1) {
                arrayCircle.splice(index, 1);
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
    let randomR = Math.floor(Math.random() * 34 + 19);
    let randomX, randomY;
    do {
        randomX = Math.random() * (canvasWidth - randomR * 2) + randomR;
        randomY = - canvasHeight + Math.random() * (canvasHeight - randomR * 2) + randomR;
    } while (checkOverlap(randomX, randomY, randomR));
    let randomS = (Math.random() * 4.5 + 0.5);
    let imageUrl = ['images\\atackmax.png', 'images\\atack.png', 'images\\atack2.png', 'images\\atack3.png', 'images\\Extralife.png','images\\atack4.png'];
    const circulo = Math.floor(Math.random() * imageUrl.length);
    let miCirculo = new Circle(randomX, randomY, randomR, randomS, imageUrl[circulo]);

    arrayCircle.push(miCirculo);
}
let circlesCreated = 0;
let Delay = 3400;
let createCirclesTimeout; // Variable para almacenar el identificador del temporizador

function createCircles() {
    function generateCircleWithDelay(currentDelay) {
        createCircle();
        circlesCreated++;
        console.log(Delay);
        if (Delay > 1000) {
            Delay -= 100;
        } else if (Delay <= 1000 && Delay !== 500) {
            Delay -= 10;
        }
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
///////////////Controla superposicion al crear circulos/////////////////

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
                    puntaje = puntaje +15;
                    puntajeElement.textContent = `Puntaje: ${puntaje}`; // Actualizar el marcador
                    lifesElement.textContent = `Vidas: ${lifes}`; // Actualizar el marcador
                    circle.collisionOccurred = true;
                } else {
                    puntaje = puntaje - 10;
                    puntajeElement.textContent = `Puntaje: ${puntaje}`; // Actualizar el marcador
                    score--; // Incrementar el puntaje
                    scoreElement.textContent = `Vida del enemigo: ${score}`; // Actualizar el marcador
                    lifes = lifes - 1;
                    lifesElement.textContent = `Vidas: ${lifes}`; // Actualizar el marcador
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

class Bullet {
    constructor(x, y, width, height, speed, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

let bullets = [];


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

let bulletInterval;
let atack = false;
canvas.addEventListener('mousemove', function (event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;


    if (atack == true) {
        clearInterval(bulletInterval);

        // Creamos un nuevo intervalo que generará una bala cada 5 segundos
        bulletInterval = setInterval(() => {
            bullets.push(new Bullet(mouseX, mouseY, 5, 10, 5, 'red'));
        }, 100); // 5000 milisegundos = 5 segundos
    }

    mouse.updatePosition(mouseX, mouseY);
});


/////////////////////////
function updateCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(imagen, 0, 0, canvasWidth, canvasHeight); // Dibujar la imagen de fondo nuevamente

    if (enemy) { // Comprueba si el villano debe estar presente
        villain.update();
        villain.draw(ctx);
    }

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw(ctx);

        if (
            mouse.posX < villain.x + villain.width &&
            mouse.posX > villain.x &&
            mouse.posY < villain.y + villain.height &&
            mouse.posY > villain.y
        ) {
            lifes = 0;
        }

        // Eliminar balas fuera del lienzo
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }

        if (
            bullet.x < villain.x + villain.width &&
            bullet.x + bullet.width > villain.x &&
            bullet.y < villain.y + villain.height &&
            bullet.y + bullet.height > villain.y
        ) {
            // Si hay una colisión, eliminamos la bala y restamos puntos
            bullets.splice(index, 1);
            score--;
            scoreElement.textContent = `Vida del enemigo: ${score}`; // Actualizar el marcador
            puntaje = puntaje +9;
            puntajeElement.textContent = `Puntaje: ${puntaje}`; // Actualizar el marcador

        }
    });
    if (lifes > 0) {
        updateCircles();
    } else {
        if (!gameOverFlag) { // Solo ejecuta este bloque una vez
            imagen.src = 'images/lose.png'; // Reemplaza esto con la ruta a tu imagen de fondo
            clearTimeout(createCirclesTimeout);
            gameOverElement.style.display = 'block'; // O 'inline', 'inline-block', dependiendo del tipo de elemento
            lifesElement.textContent = `Vidas: ${lifes}`; // Actualizar el marcador
            puntaje = puntaje - 500;
            puntajeElement.textContent = `Puntaje: ${puntaje}`; // Actualizar el marcador
            atack = false;
            clearInterval(bulletInterval);
            enemy = false; // Desactiva la aparición del villano
            gameOverFlag = true; // Marca el juego como terminado
            actualizarMaxScore(puntaje);
        }
    }
    

    if (score == 0) {
        if (!gameWinFlag) { // Solo ejecuta este bloque una vez
            imagen.src = 'images/win.png'; // Reemplaza esto con la ruta a tu imagen de fondo
            arrayCircle = []; // Elimina todos los círculos del array
            clearTimeout(createCirclesTimeout);
            gameWinElement.style.display = 'block'; // O 'inline', 'inline-block', dependiendo del tipo de elemento
            scoreElement.textContent = `Vida del enemigo: ${score}`; // Actualizar el marcador
            puntaje = puntaje + 1000;
            puntajeElement.textContent = `Puntaje: ${puntaje}`; // Actualizar el marcador
            atack = false;
            clearInterval(bulletInterval);
            enemy = false; // Desactiva la aparición del villano
            gameWinFlag = true; // Marca el juego como ganado
            actualizarMaxScore(puntaje);
        }

    }
    

    mouse.draw(ctx); // Dibujar el cuadrado que sigue al mouse
    requestAnimationFrame(updateCanvas);
}
updateCanvas();
/////////////////////////


class Villain {
    constructor(width, height, speed, imageUrl) {
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = 0; // La posición en y permanece constante en la parte superior de la pantalla
        this.direction = Math.random() < 0.5 ? -1 : 1;// Dirección del movimiento: 1 para derecha, -1 para izquierda
        this.image = new Image();
        this.image.src = imageUrl;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        // Mover el villano horizontalmente
        this.x += this.speed * this.direction;

        // Cambiar la dirección si alcanza los límites del canvas
        if (this.x <= 0 || this.x + this.width >= canvasWidth) {
            this.direction *= -1;
            this.speed = this.speed + 0.1;
        }
    }
}

let villain = new Villain(80, 120, 0.4, 'images\\villano.png');
////////////////////////////

// Función para actualizar el puntaje máximo en localStorage
function actualizarMaxScore(puntaje) {
    // Obtiene el puntaje máximo almacenado en localStorage
    let maxScore = localStorage.getItem('maxScore');

    // Convierte el puntaje máximo almacenado a un número entero
    maxScore = maxScore ? parseInt(maxScore) : 0;

    // Actualiza el puntaje máximo si el puntaje actual es mayor
    if (puntaje > maxScore) {
        maxScore = puntaje;
        // Almacena el nuevo puntaje máximo en localStorage
        localStorage.setItem('maxScore', maxScore);
    }

    // Muestra el puntaje máximo en el elemento maxScoreElement
    maxScoreElement.textContent = `Puntaje Máximo: ${maxScore}`;
}

// Al cargar la página, muestra el puntaje máximo almacenado en localStorage
window.onload = function() {
    let maxScore = localStorage.getItem('maxScore');
    if (maxScore) {
        maxScoreElement.textContent = `Puntaje Máximo: ${maxScore}`;
    }
};



//////////////BOTON START/////////////
document.getElementById('startButton').addEventListener('click', function () {
    this.style.display = 'none';
    audio.play(); // Reproducir el audio cuando comience el juego
    createCircles();
    updateCanvas();
    atack = true;
    enemy = true; // Establece enemy en true cuando se hace clic en el botón de inicio
});
