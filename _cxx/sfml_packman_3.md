---
title: "Клон Packman: стены и проходы лабиринта"
preview: img/preview_packman_3.png
subtitle: 'В этом примере мы добавим в мир пакмана лабиринт, настроим его отрисовку, но сталкиваться со стенами лабиринта герой пока что не будет'
github: https://github.com/ps-group/sfml-packman/tree/master/packman_3
---

## Деление мира на клетки

Клетка – это всего лишь квадратная область пикселей заданного размера. Вместо того, чтобы работать с картой, заданной изображением некоторого фиксированного размера, можно работать с массивом из номеров клеток, из которого можно выложить изображение карты любого размера, и вывести на экран только видимую (или потенциально видимую) часть карты. Также можно задать атрибуты каждой клетки и накладывать клетки друг на друга, что позволит сделать карты более динамичными.

В игре Packman игрок находится в лабиринте, заполненном пирогами. Он должен съесть все пироги и избежать столкновения с четырьмя призраками, которые его преследуют. Вы бы могли реализовать подобную игру, просто нарисовав лабиринт как монолитную картинку. И тогда вас ждут проблемы с проверкой столкновений игрока с пирогом, стеной или призраками.

Мы будем строить лабиринт из набора блоков. На данный момент обойдёмся всего двумя типами блоков: стенами и проходами. Впоследствии мы улучшим лабиринт, сделав блоки более разнообразными, как в иллюстрации:

![Иллюстрация](img/PacMan.gif)

Другой хороший пример эффективного применения клетчатых карт &mdash; аркады и платформеры. Карты в таких игра строятся из нескольких базовых блоков (платформы, стенки, составные объекты, телепортеры и так далее). Использование двумерных полей позволит сильно сэкономить память и упростит реализацию проверок на столкновения.

## Хранение лабиринта

Для хранения лабиринта на данном этапе мы не будем использовать внешние файлы. Вместо этого данные о наличии блоков и проходов будут сохранены в константном массиве в файле `flield.cpp`. Такой подход чреват постоянной перекомпиляцией проекта после каждого изменения структуры лабиринта, но позволяет быстро сделать прототип игрыы.

### Константы файла field.cpp
```
static const float BLOCK_SIZE = 25.f;
static const size_t FIELD_WIDTH = 32;
static const size_t FIELD_HEIGHT = 24;
static const char FIELD_MAZE[] = {
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
};
```

### Определение сущности "Field"

Игровое поле, содержащее лабиринт, мы определим как структуру "Field". В структуре будет храниться указатель на массив прямоугольников, чтобы не пришлось задавать в массиве фиксированное число клеток игрового поля. Чтобы сделать работу с указателями более безопасной, будут выделены функции initializeField и destroyField, которые соответственно инициализируют поля структуры "Field" (с выделением памяти для поля "rects") и освобождают память, выделенную для клеток поля. Таким образом, потенциально опасный код сейчас хотя бы выделен в отдельную функцию.

```
#pragma once
#include <SFML/Graphics.hpp>

struct Field
{
    size_t width = 0;
    size_t height = 0;
    sf::RectangleShape *rects = nullptr;
};

void initializeField(Field &field);
void drawField(sf::RenderWindow &window, const Field &field);
void destroyField(Field &field);
```

## Функции для работы с полем игры

- Для инициализации поля мы воспользуемся двумя циклами (один вложен в другой), заполняющими поле данными.
- Память под массив `rects` будем выделять с помощью new[], и освобождать в методе destroyField с помощью delete[]

Следует отметить, что в C++ следует различать `delete` и `delete[]`: если вы выделяли память под массив элементов с помощью `new T[size]`, то вы должны использовать delete[] вместо delete. Подробнее об этом рассказано в статье [delete, new[] в C++ и городские легенды об их сочетании (habrahabr.ru)](https://habrahabr.ru/company/abbyy/blog/117208/).

```
static const sf::Color BROWN_COLOR = sf::Color(163, 58, 3);
static const sf::Color WHITE_COLOR = sf::Color(255, 255, 255);

void initializeField(Field &field)
{
    field.width = FIELD_WIDTH;
    field.height = FIELD_HEIGHT;
    field.rects = new sf::RectangleShape[field.width * field.height];
    for (size_t y = 0; y < field.height; y++)
    {
        for (size_t x = 0; x < field.width; x++)
        {
            const size_t offset = x + y * field.width;
            sf::Color color;
            if (FIELD_MAZE[offset] == 1)
            {
                color = BROWN_COLOR;
            }
            else
            {
                color = WHITE_COLOR;
            }
            sf::RectangleShape &rect = field.rects[offset];
            rect.setPosition(x * BLOCK_SIZE, y * BLOCK_SIZE);
            rect.setSize(sf::Vector2f(BLOCK_SIZE, BLOCK_SIZE));
            rect.setFillColor(color);
        }
    }
}

void destroyField(Field &field)
{
    delete[] field.rects;
}
```

Для рисования всего игрового поля достаточно пройти циклом по массиву rects, перебрав `width*height` элементов:

```cpp
void drawField(sf::RenderWindow &window, const Field &field)
{
    for (size_t i = 0; i < field.width * field.height; i++)
    {
        window.draw(field.rects[i]);
    }
}
```

## Добавления поля в игру

Рассмотрим, как добавить игровое поле в рамках паттерна Game Loop.

- На шаге инициализации нам потребуется создать поле и вызвать функцию initializeField
- На шаге обработки событий ничего не меняется
- Обновления поля пока что не требуется, то в шаге Update есть ничего не меняется
- При рисовании потребуется информация о поле, поэтому мы передадим поле в функцию render

```cpp
int main(int, char *[])
{
    sf::RenderWindow window(sf::VideoMode(800, 600), "Window Title");
    Packman packman;
    initializePackman(packman);
    Field field;
    initializeField(field);

    sf::Clock clock;

    while (window.isOpen())
    {
        handleEvents(window, packman);
        update(clock, packman);
        render(window, packman, field);
    }

    return 0;
}
```

Рисовать поле следует перед рисованием пакмана, иначе пакман будет стёрт, и поле будет нарисовано на всё окно. Адаптируем функцию render для рисования поля:

```cpp
void render(sf::RenderWindow & window, const Packman &packman, const Field &field)
{
    window.clear();
    drawField(window, field);
    // пакман рисуется после поля.
    window.draw(packman.shape);
    window.display();
}
```

## Результат

![скриншот](img/preview_packman_3.png)