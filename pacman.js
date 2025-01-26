// Класс для Пакмана
class Pacman {
    // Конструктор класса
    constructor(x, y, width, height, speed) {
        this.x = x;             // Начальная позиция по оси X
        this.y = y;             // Начальная позиция по оси Y
        this.width = width;     // Ширина
        this.height = height;   // Высота
        this.speed = speed;     // Скорость
        this.direction = 4;     // Направление (по умолчанию вправо)
        this.nextDirection = 4; // Следующее направление
        this.frameCount = 7;    // Количество кадров анимации
        this.currentFrame = 1;  // Текущий кадр анимации
        // Интервал для смены анимации
        setInterval(() => {
            this.changeAnimation();
        }, 100);
    }

    // Основной процесс движения Пакмана
    moveProcess() {
        this.changeDirectionIfPossible(); // Меняем направление, если возможно
        this.moveForwards();              // Двигаемся вперед
        if (this.checkCollisions()) {     // Если столкновение
            this.moveBackwards();         // Двигаемся назад
            return;
        }
    }

    // Процесс поедания точек
    eat() {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (
                    map[i][j] == 2 &&           // Если точка на карте
                    this.getMapX() == j &&      // Позиция Пакмана совпадает с точкой
                    this.getMapY() == i         // Позиция Пакмана совпадает с точкой
                ) {
                    map[i][j] = 3;             // Точка съедена
                    score++;                    // Увеличиваем счет
                }
            }
        }
    }

    // Движение Пакмана назад (при столкновении)
    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT:  // Вправо
                this.x -= this.speed;
                break;
            case DIRECTION_UP:     // Вверх
                this.y += this.speed;
                break;
            case DIRECTION_LEFT:   // Влево
                this.x += this.speed;
                break;
            case DIRECTION_BOTTOM: // Вниз
                this.y -= this.speed;
                break;
        }
    }

    // Движение Пакмана вперед
    moveForwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT:  // Вправо
                this.x += this.speed;
                break;
            case DIRECTION_UP:     // Вверх
                this.y -= this.speed;
                break;
            case DIRECTION_LEFT:   // Влево
                this.x -= this.speed;
                break;
            case DIRECTION_BOTTOM: // Вниз
                this.y += this.speed;
                break;
        }
    }

    // Проверка на столкновение с препятствиями (стенами)
    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize)
            ] == 1 || // Столкновение с блоком
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize)
            ] == 1 || // Столкновение с блоком
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1 || // Столкновение с блоком
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1   // Столкновение с блоком
        ) {
            isCollided = true; // Если столкновение, то возвращаем true
        }
        return isCollided;
    }

    // Проверка столкновения с призраками
    checkGhostCollision(ghosts) {
        for (let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            if (
                ghost.getMapX() == this.getMapX() && // Если Пакман и призрак на одной клетке по X
                ghost.getMapY() == this.getMapY()    // Если Пакман и призрак на одной клетке по Y
            ) {
                return true;  // Столкновение с призраком
            }
        }
        return false; // Нет столкновения с призраками
    }

    // Метод для смены направления, если возможно
    changeDirectionIfPossible() {
        if (this.direction == this.nextDirection) return; // Если направление не изменилось, ничего не делаем
        let tempDirection = this.direction;
        this.direction = this.nextDirection;  // Меняем направление
        this.moveForwards();                   // Двигаемся вперед
        if (this.checkCollisions()) {          // Если столкновение
            this.moveBackwards();              // Двигаемся назад
            this.direction = tempDirection;    // Возвращаем прежнее направление
        } else {
            this.moveBackwards();              // Двигаемся назад
        }
    }

    // Получение позиции по X на карте
    getMapX() {
        let mapX = parseInt(this.x / oneBlockSize); // Округляем значение для X
        return mapX;
    }

    // Получение позиции по Y на карте
    getMapY() {
        let mapY = parseInt(this.y / oneBlockSize); // Округляем значение для Y
        return mapY;
    }

    // Получение правой границы позиции по X
    getMapXRightSide() {
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize); // Округляем для правой границы
        return mapX;
    }

    // Получение правой границы позиции по Y
    getMapYRightSide() {
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize); // Округляем для правой границы
        return mapY;
    }

    // Метод для смены анимации (кадры)
    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1; // Меняем кадр анимации
    }

    // Метод для рисования Пакмана на экране
    draw() {
        canvasContext.save();
        canvasContext.translate(
            this.x + oneBlockSize / 2,
            this.y + oneBlockSize / 2
        );
        canvasContext.rotate((this.direction * 90 * Math.PI) / 180); // Поворот Пакмана в зависимости от направления
        canvasContext.translate(
            -this.x - oneBlockSize / 2,
            -this.y - oneBlockSize / 2
        );
        // Рисуем изображение Пакмана
        canvasContext.drawImage(
            pacmanFrames,
            (this.currentFrame - 1) * oneBlockSize, // Кадр
            0,
            oneBlockSize,
            oneBlockSize,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}
