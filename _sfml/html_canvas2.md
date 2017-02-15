---
title: "Анимация"
---

## Предисловие
Для покадровой отрисовки следует использовать функцию requestAnimationFrame. Почему это следует делать описано в [этой](https://learn.javascript.ru/js-animation) статье.

## Анимация пакмена
Разберём анимацию на примерах - попробуем анимировать пакмена из предыдущей статьи. По сути анимация состоит из двух шагов. Шаг первый - изменить состояние. Шаг второй - нарисовать его. Всё просто. Но есть одно НО: прежде чем рвануться реализовывать этот алгоритм надо понять, что является состоянием. В нашем случае состояние - пакмен.

Для проработки структуры пакмена следует задать вопрос: что важно знать, чтобы нарисовать пакмена?
Ответ прост и заключается в четырёх пунктах:

 1. координаты
 2. размер
 3. цвет
 4. угол, на который пакмен раскрыл рот.

Реализуем данный объект.

```js
function Packman(x, y, radius, color)
{
    this.COLOR = color;
    this.RADIUS = radius;

    this._x = x;
    this._y = y;
    this._smileAngle = 1;

    this.getX = function()
    {
        return this._x;
    };
    this.getY = function()
    {
        return this._y;
    };
    this.getSmileAngle = function()
    {
        return this._smileAngle;
    };
}
```

После этого надо подумать о том, как изменять состояние. В этом случае пакмен будет шевелить ртом.
Для изменения угла его рта мы написали вот такую, интересную функцию и добавили новое свойство smileAngleStep, отвечающее за скорость движения челюстей.
В результате получился вот такой объект:

```js
function Packman(x, y, radius, color)
{
    this.COLOR = color;
    this.RADIUS = radius;

    this._x = x;
    this._y = y;
    this._smileAngle = 1;
    this._smileAngleStep = 5;

    this.getX = function ()
    {
        return this._x;
    };
    this.getY = function ()
    {
        return this._y;
    };
    this.getSmileAngle = function()
    {
        return this._smileAngle;
    };
    this.calcSmileAngle = function ()
    {
        this._smileAngle += this._smileAngleStep;
        if ((this._smileAngle >= 90) || (this._smileAngle <= 1))
        {
            this._smileAngleStep = - this._smileAngleStep;
        }
    };
}
```

Для отрисовки пакмена можно использовать уже написанные в первой статье функции, предварительно дописав их для работы с нашим объектом.
В результате получилось слудующее:

```js
function drawPackman(canvasContext, packman)
{
    var cordX = packman.getX() + packman.RADIUS;
    var cordY = packman.getY() + packman.RADIUS;
    var smileAngel = degToRad(packman.getSmileAngle());
    canvasContext.translate(cordX, cordY);
    canvasContext.rotate(-smileAngel / 2);
    drawPackmanFigure(canvasContext, 0, 0, packman.RADIUS, packman.COLOR, smileAngel);
    canvasContext.rotate(smileAngel / 2);
    canvasContext.translate(-cordX, -cordY);
    packman.isOpened = !packman.isOpened;
}
```

Вот мы и добрались до кульминации, функции "серцебиения" анимации.

```js
function initTick(canvasContext)
{
    var packman = new Packman(100, 100, 100, "#efef11");
    animationTick();
    function animationTick()
    {
        packman.calcSmileAngle(); // перещёт состояния
        canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // очистка экрана
        drawPackman(canvasContext, packman); // отрисовка пакмена
        window.requestAnimationFrame(animationTick);
    }
}
```

Осталось только инициализироваться.

```js
window.onload = function()
{
    var canvas = document.getElementById("canvas");
    var canvasContext = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    initTick(canvasContext);
};
```

Полюбуемся результатом.

![Скриншот](img\html_canvas\animated_packman.gif)

## Спрайты
Для создания анимации можно использовать двухмерные [спрайты](https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D1%80%D0%B0%D0%B9%D1%82_(%D0%BA%D0%BE%D0%BC%D0%BF%D1%8C%D1%8E%D1%82%D0%B5%D1%80%D0%BD%D0%B0%D1%8F_%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D0%BA%D0%B0)). При этом принцип кардинально не меняется, меняется лишь способ отрисовки кадров. Напишем пакмена, который бы использовал спрайты для отрисовки самого себя.

Чтобы отрисовать один кадр нам надо знать:

 1. Координаты
 2. Фактические размеры изображения
 3. Сдвиг относительно начала спрайта
 4. Размеры одного состояния на спрайте

 ![Схема](img\html_canvas\packman_sprite.png)

Напишим объект пакмена по заданным требованиям.

```js
function SpritePackman(x, y, width, height, packmanSprite)
{
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._sprite = new Image();
    this._sprite.src = packmanSprite.src;
    this._isImageLoaded = false;
    var that = this;
    this._sprite.onload = function ()
    {
      that._isImageLoaded = true;
        that._spriteWidth = that._sprite.width / packmanSprite.spriteNumber;
        that._spriteHeight = that._sprite.height;
    };
    /*
        Если написать буз обработчика события,
        то браузер может не успеть подгрузить картинку,
        так что that._sprite.width будет равно undefined.
    */
    this._spritePos = 0;
    this._getCurrentSpritePos = function()
    {
        return this._spriteWidth * this._spritePos;
    };
}
```

Чтобы отрисовать данный объект, надо знать все его свойства. Выносить в отдельную функцию его отрисовку в данном случае будет неразумно, поэтому следует написать метод draw.

```js
this.draw = function (canvasContext)
{
    if (this._isImageLoaded)
    {
        canvasContext.drawImage(
            this._sprite,
            this._getCurrentSpritePos(), 0, this._spriteWidth, this._spriteHeight,
            this._x, this._y, this._width, this._height
        );
    }
};
```

Осталось совсем ничего: научить его обновлять своё состояние. Для этого напишем метод increaseSpritePos, который сдвигает состояние вперёд.

```js
this.increaseSpritePos = function ()
{
    this._spritePos++;
    this._spritePos %= PACKMAN_SPRITE.spriteNumber;
};
```

Теперь объект готов к использованию. Проверим, как он работает! Создадим и попросим его отрисовываться.

```js
var PACKMAN_SPRITE = {
    src: "img/packman_sprite.png",
    spriteNumber: 18
};

function initTick(canvasContext)
{
    var packman = new Packman(100, 100, 100, "#efef11");
    var spritePackman = new SpritePackman(500, 100, 200, 200, PACKMAN_SPRITE);
    animationTick();
    function animationTick()
    {
        canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        packman.calcSmileAngle();
        spritePackman.increaseSpritePos();
        drawPackman(canvasContext, packman);
        spritePackman.draw(canvasContext);
        window.requestAnimationFrame(animationTick);
    }
}
```

Результат несильно отличается от первой реализации.

![Скриншот](img\html_canvas\animated_packman.gif)
