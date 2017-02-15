---
title: "Анимация"
---

## Предисловие
Для покадровой отрисовки следует использовать функцию requestAnimationFrame. Почему это следует делать описано в [этой](https://learn.javascript.ru/js-animation) статье.

## Анимация рта пакмена
Разберём анимацию на примерах - попробуем анимировать пакмена из предыдущей статьи. По сути анимация состоит из двух шагов. Шаг первый - изменить состояние. Шаг второй - нарисовать его. Всё просто. Но есть одно НО. Прежде чем рвануться реализовывать этот алгоритм надо понять: что является состоянием. В нашем случае состояние - пакмен.

Для проработки структуры пакмена следует задать вопрос: что важно знать, чтобы нарисовать пакмена?
Ответив на него можно понять, что для этого важно:

 1. где пакмен находится
 2. какого он размера
 3. какого он цвета
 4. как широка его улыбка.

Вот таким он получился.

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
В результате получился вот такой объект

```js
function Packman(x, y, radius, color)
{
    this.COLOR = color;
    this.RADIUS = radius;

    this._x = x;
    this._y = y;
    this._smileAngle = 1;
    this._smileAngleStep = 5;

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
В результате получилось слудующее.

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

Вот мы и добрались до кульминации, функции серцебиения анимации.

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
