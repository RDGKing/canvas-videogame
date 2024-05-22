const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let canvasWidth = 700;
let canvasHeight = 400;

canvas.width = canvasWidth;
canvas.height = canvasHeight;


// Función para generar colores RGB aleatorios
function generarColorRGB() {
    var r = Math.floor(Math.random() * 256); // Valor de rojo entre 0 y 255
    var g = Math.floor(Math.random() * 256); // Valor de verde entre 0 y 255
    var b = Math.floor(Math.random() * 256); // Valor de azul entre 0 y 255
    var color_rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
    return color_rgb;
}

// Clase Circle
class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;
        this.dx = 1 * this.speed;
        this.dy = -1 * this.speed; // Cambiar a dirección hacia arriba
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 3;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
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
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }
}

// Función para obtener la distancia entre dos puntos
function getDistance(posX1, posY1, posX2, posY2) {
    let result = Math.sqrt(Math.pow((posX2 - posX1), 2) + Math.pow((posY2 - posY1), 2));
    return result;
}

let arrayCircle = [];

for (let i = 0; i < 10; i++) {
    let randomR = Math.floor(Math.random() * 30 + 15);
    let randomX, randomY;

    // Generar coordenadas aleatorias hasta que no se superpongan con otros círculos
    do {
        randomX = Math.random() * (canvasWidth - randomR * 2) + randomR;
        randomY = canvasHeight + Math.random() * (canvasHeight - randomR * 2) + randomR;
    } while (checkOverlap(randomX, randomY, randomR)); // Verificar superposición

    let randomS = Math.floor(Math.random() * 3 + 2);

    let miCirculo = new Circle(randomX, randomY, randomR, generarColorRGB(), (i + 1), randomS);
    arrayCircle.push(miCirculo);
}

function checkOverlap(x, y, radius) {
    // Verificar si el círculo generado está superpuesto con algún otro círculo existente
    for (let i = 0; i < arrayCircle.length; i++) {
        let circle = arrayCircle[i];
        let distance = getDistance(x, y, circle.posX, circle.posY);
        if (distance <= radius + circle.radius) {
            return true; // Superposición detectada
        }
    }
    return false; // No hay superposición
}

function updateCircles() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    arrayCircle.forEach(circle => {
        circle.update(ctx);

        arrayCircle.forEach(circletwo => {
            if (circle !== circletwo && getDistance(circle.posX, circle.posY, circletwo.posX, circletwo.posY) <= (circle.radius + circletwo.radius)) {


                let angulo = Math.atan2(circletwo.posY - circle.posY, circletwo.posX - circle.posX);
                //console.log("angulo: " + angulo * 180 / Math.PI);

                circle.color = generarColorRGB();
                circletwo = generarColorRGB();
                let PosNewX = Math.cos(angulo);
                let PosNewY = Math.sin(angulo);
                // console.log("X: " + PosNewX * 180 / Math.PI);
                // console.log("Y: " + PosNewY * 180 / Math.PI);

                circle.dx = circle.speed * -PosNewX;
                circle.dy = circle.speed * -PosNewY;
                circletwo.dx = circletwo.speed * PosNewX;
                circletwo.dy = circletwo.speed * PosNewY;
            }
        });
    });
    requestAnimationFrame(updateCircles);
}

updateCircles();

// Event listener para el clic del mouse en el canvas
canvas.addEventListener("click", function (event) {
    let rect = canvas.getBoundingClientRect(); // Obtener las dimensiones y posición del canvas
    let mouseX = event.clientX - rect.left; // Coordenada X del clic ajustada al canvas
    let mouseY = event.clientY - rect.top; // Coordenada Y del clic ajustada al canvas

    // Verificar si el clic está dentro de algún círculo
    for (let i = 0; i < arrayCircle.length; i++) {
        let circle = arrayCircle[i];
        let dx = mouseX - circle.posX;
        let dy = mouseY - circle.posY;
        let distanceSquared = dx * dx + dy * dy; // Distancia euclidiana al cuadrado
        if (distanceSquared <= circle.radius * circle.radius) {
            // Eliminar el círculo del array
            arrayCircle.splice(i, 1);
            break; // Salir del bucle una vez que se elimina un círculo
        }
    }

    // Limpiar el canvas y redibujar los círculos restantes
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    arrayCircle.forEach(circle => {
        circle.draw(ctx);
    });
});