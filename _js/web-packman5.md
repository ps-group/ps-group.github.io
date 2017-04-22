---
title: "Очки и особенности js"
preview: img/web-packman/web_packman-screenshot-5.png
---

## Особенности разработки на js

В js одной из самых дорогостоящих по времени операций является выделение памяти, поэтому стоит сократить  создание объектов. Поэтому, когда пользователь собирает очки, их объекты не удаляются, а становятся неактивными. При рестарте игры, они становятся активными.

```js
var Point = function(x, y)
{
    this.used = false;
...
```

Логика  сбора очков. Находится в GameStateUpdateSystem, так как это действие над предметом.

```js
this._updatePoints = function(state)
{
    var intersectedPointIndex = collisions.getIntersectedPointIndex(state.packman.person, state.points);

    if (intersectedPointIndex != -1)
    {
        state.packman.score++;
        state.points.splice(intersectedPointIndex, 1);
    }
};
````
Результат:

![Скриншот](img\web-packman\web_packman-screenshot-5.png)
