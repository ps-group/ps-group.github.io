---
title: "Кнопки и меню"
---

## Кнопка
Кнопка - интерактивный элемент с тремя состояниями. Первое - неактивна, второе - мышка занесена над кнопкой, третье - активное (мышка нажала на кнопку). Чтобы её реализовать, надо задать вопрос: что важно для кнопки?

 1. Координаты
 2. Размеры
 3. Спрайт
 4. Текущее состояние

Собрав требования, можно написать объект кнопки.

```js
function  Button(canvasContext)
{
    this._state = Button.DEACTIVATED;
    this._spriteLoaded = false;

    this._x;
    this._y;
    this._width;
    this._height;
    this._sprite;
    this._spriteWidth = 0;
    this._spriteHeight = 0;

    this.getState = function ()
    {
        return this._state;
    };

    this._draw = function ()
    {
        canvasContext.drawImage(that._sprite,
            that._state * that._spriteWidth, 0, that._spriteWidth, that._spriteHeight,
            that._x, that._y, that._width, that._height);
    };

    this._initView = function (view)
    {
        this._x = view.x;
        this._y = view.y;
        this._width = view.width;
        this._height = view.height;
        this._sprite = new Image();
        this._sprite.src = view.sprite;
        this._sprite.onload = function ()
        {
            that._spriteLoaded = true;
            that._spriteWidth = that._sprite.width / 3; // state number
            that._spriteHeight = that._sprite.height;
        };
    };
}

// Button тоже объект, поэтому ему можно задать свойства.
Button.DEACTIVATED = -1;
Button.INACTIVE = 0;
Button.HOVER = 1;
Button.ACTIVE = 2;
```

Можно приступать к обработке событий кнопки. Для их отслеживания необходимо иметь доступ к стандартным DOM событиям тега *canvas*. Кроме того, поскольку события из коробки работают только с DOM-узлами, их придётся пробрасывать через *canvas*, а кнопок может быть много, значит надо ввести *id*.

```js
function  Button(id, canvas, canvasContext)
{
    //...
    this._id = id;
    this._getId = function ()
    {

    };
}
```

Напишим функцию, инициализирующую события.

```js
this.activate = function (view)
{
    this._state = Button.INACTIVE;
    this._initView(view);
    canvas.addEventListener("redraw", this._draw);
    canvas.addEventListener("mousemove", function (event)
    {
        event.buttonState = Button.HOVER;
        event.eventType = ":hover";
        var click = this._getClickCoordinates(event);
        if (this._InButton(click))
        {
            this._state = event.buttonState;
            canvas.dispatchEvent(new Event(this._id + event.eventType));
        }
        event.buttonState = Button.INACTIVE;
        var click = this._getClickCoordinates(event);
        if (!this._InButton(click))
        {
            this._state = event.buttonState;
        }
        that._hoverHandler = this; // save function
    });
    canvas.addEventListener("mousedown", function (event)
    {
        event.buttonState = Button.ACTIVE;
        event.eventType = ":down";
        var click = this._getClickCoordinates(event);
        if (this._InButton(click))
        {
            this._state = event.buttonState;
            canvas.dispatchEvent(new Event(this._id + event.eventType));
        }
        that._downHandler = this; // save function
    });
    canvas.addEventListener("mouseup", function (event)
    {
        event.buttonState = Button.INACTIVE;
        event.eventType = ":up";
        var click = this._getClickCoordinates(event);
        if (this._InButton(click))
        {
            this._state = event.buttonState;
            canvas.dispatchEvent(new Event(this._id + event.eventType));
        }
        that._upHandler = this; // save function
    });
};
```

Уберём дублирование.

```js
this.activate = function (view)
{
    this._state = Button.INACTIVE;
    this._initView(view);
    canvas.addEventListener("redraw", this._draw);
    canvas.addEventListener("mousemove", function (event)
    {
        event.buttonState = Button.HOVER;
        event.eventType = ":hover";
        that._aboveEventHandle(event);
        event.buttonState = Button.INACTIVE;
        that._outEventHandle(event);
        that._hoverHandler = this; // save function
    });
    canvas.addEventListener("mousedown", function (event)
    {
        event.buttonState = Button.ACTIVE;
        event.eventType = ":down";
        that._aboveEventHandle(event);
        that._downHandler = this; // save function
    });
    canvas.addEventListener("mouseup", function (event)
    {
        event.buttonState = Button.INACTIVE;
        event.eventType = ":up";
        that._aboveEventHandle(event);
        that._upHandler = this; // save function
    });
};

this._aboveEventHandle = function (event)
{
    var click = this._getClickCoordinates(event);
    if (this._InButton(click))
    {
        this._state = event.buttonState;
        canvas.dispatchEvent(new Event(this._id + event.eventType));
    }
};

this._outEventHandle = function (event)
{
    var click = this._getClickCoordinates(event);
    if (!this._InButton(click))
    {
        this._state = event.buttonState;
    }
};
```

Заметьте, что для высчитывания координат был использован метод *_getClickCoordinates*, так как свойства события *event.clientX* и *event.clientY* хранят координаты мыши относительно экрана, а не относительно документа.

```js
this._getClickCoordinates = function (event)
    {
        var click = {};
        click.x = event.pageX - canvas.getBoundingClientRect().left - window.scrollX;
        click.y = event.pageY - canvas.getBoundingClientRect().top - window.scrollY;
        return click;
    };
```

Напишем метод, который деактивирует кнопку, уничтожающую обработчики событий.

```js
this.deactivate = function ()
{
    this._state = Button.DEACTIVATED;
    canvas.removeEventListener("redraw", this._draw);
    canvas.removeEventListener("mouseover", this._hoverHandler);
    canvas.removeEventListener("mousedown", this._downHandler);
    canvas.removeEventListener("mouseup", this._upHandler);
    this._hoverHandler = undefined;
    this._downHandler = undefined;
    this._upHandler = undefined;
};
```

Осталась одна проблема: генерация уникального id, который бы не совпадал с другой кнопкой.
Для этого следует написать контроллер.

## Контроллер
Соберём требования для контроллера. Контроллер должен уметь:

 1. добавлять кнопку
 2. удалять кнопку
 3. генерировать уникальные id для создаваемых кнопок

  Кроме того в будущем, возможно, помимо кнопки появятся другие элементы, вроде текстовых полей и форм ввода, поэтому надо придумать универсальный способ генерации id. Также стоит учесть, что операция выделения памяти в js - дорогостоящая операция, поэтому надо сократить количество создаваемых объектов до минимума. Вместо удаления кнопки можно помечать как неактивные, а после инициализировать новыми значениями.

Получился вот такой вот класс.

```js
function  ScreenController(canvas, canvasContext)
{
    var DEACTIVATED = -1;
    this._elements = [];

    this.deleteElement = function (id)
    {
        this._elements[id].deactivate();
    };

    // element Button
    this._buttons = [];

    this.addButton = function (view)
    {
        var button = this._findFreeButton();
        if (button == null)
        {
            button = this._createNewButton();
        }
        button.activate(view);
        return button;
    };

    this._createNewButton = function ()
    {
        var id = this._elements.length;
        this._elements[id] = new Button(id, canvas, canvasContext);
        this._buttons[this._buttons.length] = id;
        return this._elements[id];
    };

    this._findFreeButton = function ()
    {
        for (var i = 0; i < this._buttons.length; ++i)
        {
            var button = this._elements[this._buttons[i]];
            if (button.getState() == DEACTIVATED)
            {
                return button;
            }
        }
        return null;
    };
    // End element Button
}
```

Разберём его подробнее. Этот класс имеет свойство *_elements*, которое хранит ссылки на элементы. Как видно из метода *_createNewButton*, *id* - это не что иное, как номер элемента в массиве *_elemnts*. Для более удобной работы с кнопками, добавлено свойство *_buttons*, которое хранит все *id* уже созданных кнопок.

Опробуем класс.

```js
var FIRST_BUTTON_VIEW = {
    x: 200,
    y: 100,
    width: 300,
    height: 60,
    sprite: "img/sprite.png"
};

var SECOND_BUTTON_VIEW = {
    x: 600,
    y: 100,
    width: 300,
    height: 60,
    sprite: "img/sprite.png"
};

function initTick(canvas, canvasContext)
{
    animationTick();
    function animationTick()
    {
        canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.dispatchEvent(new Event("redraw"));
        window.requestAnimationFrame(animationTick);
    }
}

window.onload = function()
{
    var canvas = document.getElementById("field");
    var canvasContext = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    initTick(canvas, canvasContext);

    var controller = new ScreenController(canvas, canvasContext);
    var button1 = controller.addButton(FIRST_BUTTON_VIEW);
    var button2 = controller.addButton(SECOND_BUTTON_VIEW);

    canvas.addEventListener(button2.getId() + ":up", function ()
    {
        console.log("button2 up");
    });
    canvas.addEventListener(button2.getId() + ":down", function ()
    {
        console.log("button2 down");
    });
    canvas.addEventListener(button1.getId() + ":up", function ()
    {
        controller.deleteElement(button2.getId());
    });
};
```

![Скриншот](img\html_canvas\buttons_screenshot.png)
