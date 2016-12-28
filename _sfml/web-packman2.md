---
title: "Добавим движение"
---

## Цикл игры
Для реализации цикла игры существует два способа:
1) SetTimeout/SetInterval

```js
var NEW_FRAME_DELAY = 16;
var gameInterval = setInterval(function()
{
    packman.move();
    gameStateDrawer.drawState({ packman: packman });

}, NEW_FRAME_DELAY);
```
2) requestAnimationFrame

```js
gameTick();
function gameTick()
{
    packman.move();
    gameStateDrawer.drawState({ packman: packman });
    window.requestAnimationFrame(gameTick);
}
```

В [этой](http://html5.by/blog/what-is-requestanimationframe/) статье рассмотрена причина использования второго способа.

## Чуть-чуть событий

Для инициализации обработчиков событий браузера разработана функция:

```js
function setHandlers(packmen)
{
    document.onkeydown = function(event)
    {
        downButtonsHandler(event.keyCode, packmen);
    };
    document.onkeyup = function(event)
    {
        upButtonsHandler(event.keyCode, packmen);
    };
}
```
Подробнее про события можно прочесть [здесь](https://habrahabr.ru/post/244041/)


## Js и OOP

### Соглашение о кодировании для объектов в js

Нижнее подчёркивание перед свойством или методом означает приватность. Эта условность связанна с тем, что в js нет приватности. Так что изменение свойства или вызов метода с нижними подчёркиваниями считается ошибочным, и не должно допускаться разработчиком

### Создание объекта героя

В js нет как такого oop с полиморфизмом и наследованием, можно, конечно, постараться реализовать, но из коробки это не поддерживается, да и при проектировнии пакмена можно обойтись композицией.
Как говориться: "Разделяй и властвуй". Надо разделить отрисовку и логику. Логика пока связана только с главным героем. Так что получлось два класса: Packmen(главный герой) и GameStateDrawSystem(отрисовка состояния игры)  Вот такой получился класс для главного героя:

```js
function Packman(x, y, constants)
{
    this._x = x;
    this._y = y;
    this._directionX = NONE_DIRECT;
    this._directionY = NONE_DIRECT;
    this._speed = constants.speed;

    this.move = function()
    {
        this._x += this._speed * this._directionX;
        this._y += this._speed * this._directionY;
    };

    this.getX = function()
    {
        return this._x;
    };

    this.getY = function()
    {
        return this._y;
    };

    this.setDirectionX = function(direction)
    {
        this._directionX = direction;
    };

    this.setDirectionY = function(direction)
    {
        this._directionY = direction;
    };

    this.getDirectionX = function()
    {
        return this._directionX;
    };

    this.getDirectionY = function()
    {
        return this._directionY;
    };
}
```

Это не совсем класс, а только его конструктор. При его вызове с оператором new он конструирует новый объект.
Подробнее про объекты можно узнать [здесь](https://habrahabr.ru/post/48542/).

Итого получился вот такой шарик:

![Скриншот](img\web-packman\web_packman-screenshot-2.png)
