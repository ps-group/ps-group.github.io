---
title: 'Противники и с чем их "едят"'
preview: img/web-packman/web_packman-screenshot-4.png
---

## Призраки и главный герой

Призраки представляют из себя того же главного героя. Только вот главным героем управляет пользователь, а призраками компьютер. Поэтому следует вынести их общие черты в отдельный класс Person. Тут очень помогло бы наследование от этого класса, но придётся ограничиться композицией.

```js
var Ghost = function(x, y)
{
    this.person = new Persona(x, y, GHOST_CONST);
...
```

```js
var Packman = function(x, y)
{
    this.person = new Persona(x, y, PACKMAN_CONST);
...
```

## Логика движения

Логика движения призраков заключается в случайном выборе направления на каждом повороте.

```js
this.changeDirection = function()
    {
        if (this._isTurn())
        {
            if (this.person.getDirectionY())
            {
                if (mathUtils.randInt(0, 1))
                {
                    this.person.setDirectionX(LEFT_DIRECT);
                }
                else
                {
                    this.person.setDirectionX(RIGHT_DIRECT);
                }
                this.person.setDirectionY(NONE_DIRECT);
            }
            else
            {
                this.person.setDirectionX(NONE_DIRECT);
                if (mathUtils.randInt(0, 1))
                {
                    this.person.setDirectionY(TOP_DIRECT);
                }
                else
                {
                    this.person.setDirectionY(DOWN_DIRECT);
                }
            }
        }
    };
```

Результат:

![Скриншот](img\web-packman\web_packman-screenshot-4.png)
