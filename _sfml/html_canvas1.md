---
title: "Работа с графическими примитивами"
---

## Что такое canvas и с чем его едят
Canvas - html блок, который появился вместе с выходом html5. Его особенность в том, что он предоставляет js возможность рисовать внутри себя по средствам несложного интерфейса.
```html5
<canvas id="canvas"></canvas>
```
Чтобы получить доступ к интерфейсу canvas надо обратиться в js к этому элементу и вызвать функцию getContext.
Она принимает аргументом контекст в котором будет рисовать.
```js
var canvas = document.getElementById("canvas");
var canvasContext = canvas.getContext("2d");
```
В js можно изменить размеры окна canvas. Для этого стоит использовать константы.
```js
// ./js/constants.js
var CANVAS_WIDTH = 1000;
var CANVAS_HEIGHT = 600;
// ./js/index.js
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
```
## Прямоугольники в canvas
В контексте canvas уже реализованы функции, отрисовывающие прямоугольники. Их всего три.
 * clearRect(x, y, width, height) - прямоугольник, работает, как ластик в paint
 * strokeRect(x, y, width, height) - контур прямоугольника
 * fillRect(x, y, width, height) - закрашенный прямоугольник
Цвета контура и заливки совпадают с цвеами, установленными в fillStyle и strokeStyle. Для установки цветов можно использовать как rgb, так и rgba.

## Использование линий для отрисовки фигур
Разберём функции рисования прямых линий на примере отрисовки треугольника.
```js
canvasContext.fillStyle = "#660033"; // устанавливает цвет заливки
canvasContext.strokeStyle = "#999900"; // устанавливает цвет контура
canvasContext.lineWidth = 2; // устанавливает ширину линии
canvasContext.beginPath(); // начинает запоминать фигуру
canvasContext.moveTo(150, 100); // ставит перо на одну из вершин треугольника
canvasContext.lineTo(150, 100); // проводит линию к следующей вершине
canvasContext.lineTo(100, 200); // ещё одна линия
canvasContext.lineTo(200, 100); // последняя сторона фигуру. Можно и canvasContext.closePath(), но она завершит фигуру  
canvasContext.fill(); // закрашивает фигуру заливкой
canvasContext.stroke(); // обводит фигуру контуром
canvasContext.closePath(); // очищает память
```
![Скриншот](img\html_canvas\screenshot1.png)

## Движение и поворот системы координат
Всё относительно, как говорил один дядка в двадцатом веке. Это правило не обошло и canvas. Добрые разработчики ввели две очень полезные функции
 * translate(x, y)
 * rotate(angle)
Первая смещает центр координат в заданную точку, вторая поворачивает его по часовой стрелке на заданный угол вокруг центра координат.

```js
var cordX = 400;
var cordY = 400;
var radius = 100;
var smileAngel = degToRad(90);
canvasContext.translate(cordX, cordY); // смещаем центр в центр фигуры пакмена
canvasContext.rotate(-smileAngel / 2); // поворачиваем систему координат на заданный угол
drawPackmenFigure(canvasContext, 0, 0, 100, "#cccc11", smileAngel); // рисуем пакмена
canvasContext.rotate(smileAngel / 2); // возвращаем всё на круги своя
canvasContext.translate(-cordX, -cordY);
```

## Окружности и дуги
В canvas есть функция отрисовки дуг и окружностей.
arc(centerX, centeY, radius, startAngle, endAngle, direction);
Вот [здесь](http://www.w3schools.com/tags/canvas_arc.asp) разобран её синтаксис.

Попробуем нарисовать пакмена.

```js
function drawPackmenFigure(canvasContext, x, y, radius, color, endAngle)
{
    var startPoint = {
        x: x + Math.cos(0) * radius,
        y: y + Math.sin(0) * radius
    };
    var endPoint = {
        x: x + Math.cos(endAngle) * radius,
        y: y + Math.sin(endAngle) * radius
    };
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    // рисуем вырез рта
    canvasContext.moveTo(x, y);
    canvasContext.lineTo(startPoint.x, startPoint.y);
    canvasContext.moveTo(x, y);
    canvasContext.lineTo(endPoint.x, endPoint.y);
    // рисуем тело
    canvasContext.arc(x, y, radius, endAngle, 0, false);
    canvasContext.fillStyle = color;
    canvasContext.strokeStyle = color;
    canvasContext.fill();
    canvasContext.closePath();
};
```
![Скриншот](img\html_canvas\screenshot2.png)

## Изображения
Чтобы нарисовать изображение на canvas придётся использовать функцию [drawImage](https://developer.mozilla.org/ru/docs/Web/API/CanvasRenderingContext2D/drawImage). Она рисует выбранную часть изображения с заданными размерами и координатами и может принимать до 9 агрументов. Первым аргументом во всех случаях является объект [Image](https://developer.mozilla.org/ru/docs/Web/API/HTMLImageElement/Image). После идут аргументы, описывающие маштаб и коордитнаты изображения. Существует всего три способа параметризовать эту функцию.
 1. drawImage(image, x, y) - нарисует image в координатах x, y.
 2. drawImage(image, x, y, width, height) - нарисует image в координатах x, y размера width на height.
 3. drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height) - нарисует часть image, обрезанную начиная с точки (sx, sy) размером sWidth, sHeight,  в координатах x, y, размера width на height.
Последний способ полезен для работы со спрайтами.

Чтобы лучше погрузиться в технологию canvas стоит прочитать [эту статью](https://developer.mozilla.org/ru/docs/Web/API/Canvas_API/Tutorial/%D0%9F%D1%80%D0%B8%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5_%D1%81%D1%82%D0%B8%D0%BB%D0%B5%D0%B9_%D0%B8_%D1%86%D0%B2%D0%B5%D1%82%D0%BE%D0%B2)
