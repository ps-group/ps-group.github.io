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

Можно приступать к обработке событий кнопки. Для их отслеживания необходимо иметь доступ к стандартным DOM событиям тега *canvas*. Кроме того, по скольку события из коробки работают только с DOM-узлами, их придётся пробрасывать через *canvas*, а кнопок может быть много, значит надо ввести *id*.

```js
function  Button(id, canvas, canvasContext)
{
    //...
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
