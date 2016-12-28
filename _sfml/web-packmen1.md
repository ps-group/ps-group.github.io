---
title: "Web packman 1"
---

## Отрисовка круга
[Рисование на canvas](https://habrahabr.ru/post/111308/)

## Подключение внешних файлов

Существует два способа подключать внешние js файлы:
 1. Быстрый (в конце тега body)
 2. Правильный (в теге head)

Удобно, когда все внешние файл подключены в одном месте, да и сокральный смысл тега head в том, чтобы хранить информацию о документе, да и при подключения внешних файлов в body при разрабтке игр на canvas даёт сравнительно небольшой выигрышь (~0.02 sec). Подробнее о выигрыше по скорости можно прочесть [здесь](http://taligarsiel.com/Projects/howbrowserswork1.htm)

## Соглашение о кодировании
```js
var GAME_FIELD_WIDTH = 400;
var GAME_FIELD_HEIGHT = 400;
var GAME_FIELD_ID = "gameField";
```

 По скольку в js нет констант, разработчики договорились, что переменные записанные так: THIS_IS_CONSTANT считаются константами, то есть такой код

 ```js
GAME_FIELD_WIDTH = 2;
```

считается как минимум странным и скорее всего приведёт к ошибке.