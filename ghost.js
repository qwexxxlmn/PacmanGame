class Ghost {
    // Конструктор класса
    constructor(
        x,          // Начальная позиция по оси X
        y,          // Начальная позиция по оси Y
        width,      // Ширина призрака
        height,     // Высота призрака
        speed,      // Скорость призрака
        imageX,     // Координата изображения по оси X
        imageY,     // Координата изображения по оси Y
        imageWidth, // Ширина изображения
        imageHeight,// Высота изображения
        range       // Радиус, в котором призрак "обнаруживает" Пакмана
    ) {
        this.x = x;                        // Позиция по оси X
        this.y = y;                        // Позиция по оси Y
        this.width = width;                // Ширина
        this.height = height;              // Высота
        this.speed = speed;                // Скорость
        this.direction = DIRECTION_RIGHT;  // Направление движения (по умолчанию вправо)
        this.imageX = imageX;              // Координаты для изображения
        this.imageY = imageY;
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.range = range;                // Радиус обнаружения
        this.randomTargetIndex = parseInt(Math.random() * 4);  // Рандомная цель
        this.target = randomTargetsForGhosts[this.randomTargetIndex]; // Цель для движения

        // Интервал для изменения направления каждые 10 секунд
        setInterval(() => {
            this.changeRandomDirection();
        }, 10000);
    }

    // Метод для проверки, находится ли Пакман в зоне обнаружения
    isInRange() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        if (Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range) {
            return true;
        }
        return false;
    }

    // Метод для смены цели на случайную
    changeRandomDirection() {
        let addition = 1;
        this.randomTargetIndex += addition;
        this.randomTargetIndex = this.randomTargetIndex % 4; // Предел для случайной смены цели
    }

    // Основной процесс движения призрака
    moveProcess() {
        if (this.isInRange()) {
            this.target = pacman;  // Если Пакман в зоне видимости, движемся к нему
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex]; // В противном случае движемся к случайной цели
        }
        this.changeDirectionIfPossible();  // Изменяем направление, если возможно
        this.moveForwards();               // Двигаемся вперед
        if (this.checkCollisions()) {      // Если столкновение, двигаемся назад
            this.moveBackwards();
            return;
        }
    }

    // Метод для движения назад (в случае столкновения)
    moveBackwards() {
        switch (this.direction) {
            case 4: // Вправо
                this.x -= this.speed;
                break;
            case 3: // Вверх
                this.y += this.speed;
                break;
            case 2: // Влево
                this.x += this.speed;
                break;
            case 1: // Вниз
                this.y -= this.speed;
                break;
        }
    }

    // Метод для движения вперед
    moveForwards() {
        switch (this.direction) {
            case 4: // Вправо
                this.x += this.speed;
                break;
            case 3: // Вверх
                this.y -= this.speed;
                break;
            case 2: // Влево
                this.x -= this.speed;
                break;
            case 1: // Вниз
                this.y += this.speed;
                break;
        }
    }

    // Метод для проверки столкновений с объектами на карте
    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize)] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize)] == 1 ||
            map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize + 0.9999)] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize + 0.9999)] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    // Метод для изменения направления движения
    changeDirectionIfPossible() {
        let tempDirection = this.direction;
        this.direction = this.calculateNewDirection(
            map,
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize)
        );
        if (typeof this.direction == "undefined") {
            this.direction = tempDirection;  // Если направление не найдено, возвращаем старое направление
            return;
        }
        if (
            this.getMapY() != this.getMapYRightSide() &&
            (this.direction == DIRECTION_LEFT || this.direction == DIRECTION_RIGHT)
        ) {
            this.direction = DIRECTION_UP;  // Если можно двигаться вверх, меняем направление
        }
        if (
            this.getMapX() != this.getMapXRightSide() &&
            this.direction == DIRECTION_UP
        ) {
            this.direction = DIRECTION_LEFT;  // Если можно двигаться влево, меняем направление
        }
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
        console.log(this.direction);
    }

    // Метод для вычисления нового направления движения
    calculateNewDirection(map, destX, destY) {
        let mp = [];
        for (let i = 0; i < map.length; i++) {
            mp[i] = map[i].slice();
        }

        let queue = [
            {
                x: this.getMapX(),
                y: this.getMapY(),
                rightX: this.getMapXRightSide(),
                rightY: this.getMapYRightSide(),
                moves: [],
            },
        ];
        while (queue.length > 0) {
            let poped = queue.shift();
            if (poped.x == destX && poped.y == destY) {
                return poped.moves[0];
            } else {
                mp[poped.y][poped.x] = 1;
                let neighborList = this.addNeighbors(poped, mp);
                for (let i = 0; i < neighborList.length; i++) {
                    queue.push(neighborList[i]);
                }
            }
        }

        return 1; // Направление по умолчанию
    }

    // Метод для добавления соседей в очередь для поиска пути
    addNeighbors(poped, mp) {
        let queue = [];
        let numOfRows = mp.length;
        let numOfColumns = mp[0].length;

        if (poped.x - 1 >= 0 && poped.x - 1 < numOfRows && mp[poped.y][poped.x - 1] != 1) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_LEFT);
            queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves });
        }
        if (poped.x + 1 >= 0 && poped.x + 1 < numOfRows && mp[poped.y][poped.x + 1] != 1) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_RIGHT);
            queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves });
        }
        if (poped.y - 1 >= 0 && poped.y - 1 < numOfColumns && mp[poped.y - 1][poped.x] != 1) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_UP);
            queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves });
        }
        if (poped.y + 1 >= 0 && poped.y + 1 < numOfColumns && mp[poped.y + 1][poped.x] != 1) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_BOTTOM);
            queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves });
        }
        return queue;
    }

    // Метод для получения позиции X на карте
    getMapX() {
        let mapX = parseInt(this.x / oneBlockSize);
        return mapX;
    }

    // Метод для получения позиции Y на карте
    getMapY() {
        let mapY = parseInt(this.y / oneBlockSize);
        return mapY;
    }

    // Метод для получения позиции X с правой стороны
    getMapXRightSide() {
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
        return mapX;
    }

    // Метод для получения позиции Y с правой стороны
    getMapYRightSide() {
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    // Метод для смены анимации
    changeAnimation() {
        this.currentFrame = this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    // Метод для рисования призрака на холсте
    draw() {
        canvasContext.save();
        canvasContext.drawImage(
            ghostFrames,
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}

// Функция для обновления состояния призраков
let updateGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].moveProcess();
    }
};

// Функция для отрисовки призраков на экране
let drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].draw();
    }
};
