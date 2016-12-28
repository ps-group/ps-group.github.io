---
title: "Окна и цикл игры"
---

## Подходы к созданию окон

Есть два пути проработки цикла игры:
 1. Организация окон через html
 2. Отрисовка на canvas

Первый в разы легче в реализации,  однако он усложняет процесс отладки. Логика приложения будет размазана между Html и js, что не очень хорошо.
Для реализации окна удобно использовать парадигму: [MVC](https://ru.wikipedia.org/wiki/Model-View-Controller). Я использовал статическую модель.

```js
var RESULT_WINDOW = {
    width: GAME_FIELD_WIDTH / 2,
    height: GAME_FIELD_HEIGHT / 2,
    x: (GAME_FIELD_WIDTH) / 4,
    y: (GAME_FIELD_HEIGHT) / 4,

    background: {
        borderHeight: 10,
        fillColor: "#aaaaaa",
        strokeColor: "#777777"
    },

    resultText: {
        top: 20,
        height: 42,
        color: "#444444",
        textAlign: "center",
        font: "normal 42px Arial",
        winMassage: "You win",
        loseMassage: "You lose"
    },

    score: {
        top: 40,
        right: "10%",
        message: "Your score is ",
        height: 26,
        font: "normal 26px Arial"
    },

    restartButton: {
        top: 43,
        right: "20%",
        width: "60%",
        height: 40,
        message: "Restart",
        border: 3,
        font: "normal 23px Arial",
        color: "#222222",
        borderColor: "#555555",
        background: "#dddddd"
    },

    restartButtonHover: {
        color: "#444444",
        background: "#cccccc",
        borderBackground: "#555555"
    }
};
```

Контроллером выступает объект EndGameSystem. Представлением является сам браузер. EndGameSystem является полностью самостоятельный объектом и связан с циклом игры через пользовательские события.

Про пользовательские события стоит прочитать [здесь](https://learn.javascript.ru/custom-events)

Результат:

![Скриншот](img\web-packman\web_packman-screenshot-6.png)
