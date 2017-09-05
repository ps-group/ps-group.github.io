---
title: "Клон Packman: управление персонажем"
preview: img/preview_packman_2.png
subtitle: Этот пример научит соединять события ввода (нажатия на клавиши-стрелки) с перемещением персонажа. Также мы разделим проект игры на два разных cpp-файла, один из которых будет содержать основной цикл игры, а другой - функции и константы, относящиеся к пакману.
github: https://github.com/ps-group/sfml-packman/tree/master/packman_2
---

## Как представить направление движения

На данный момент пакман представлен единственным объектом типа [sf::CircleShape](www.sfml-dev.org/documentation/latest/classsf_1_1CircleShape.php). Теперь нам потребуется ещё и хранить направление движения пакмана.

Можно было бы кодировать направление движения в виде целого числа, и считать, что 0 означает отсутствие движения, 1 — движение влево, 2 — движение вправо, и так далее. Но такие обозначения вносят путаницу, о них легко забыть, а с ростом количества кода они вообще перестают нормально восприниматься.

К счастью, в языке C есть перечислимые типы данных. Существуют они в двух вариантах: более древний простой `enum`-тип и новый, более строгий `enum struct` (он же `enum class`):

```cpp
// Старый синтаксис языка C, легко порождает конфликты с другими константами.
// добавляет во внешнюю область видимости константы NONE == 0,
// UP == 1, DOWN == 2 и так далее.
// константа NONE - слишком часто употребляемое имя.
enum Direction
{
    NONE,
    UP,
    DOWN,
    LEFT,
    RIGHT
};

// Новый синтаксис C++ 2011, позволяет избегать конфликтов
// добавляет во внешнюю область видимости константы Direction::NONE == 0,
// Direction::UP == 1 и так далее. Имя Direction::NONE ни с чем не конфликтует.
enum struct Direction
{
    NONE,
    UP,
    DOWN,
    LEFT,
    RIGHT
};
```

Мы, конечно же, применим более строгий перечислимый тип `enum struct Direction`, как указано в втором варианте объявления Direction. Добавьте в проект новый файл `packman.h` и перенесите в него объявление `enum struct Direction`.

## Замена нескольких параметров на структуру

Мы не будем использовать глобальные переменные. Код, содержащий глобальные переменные, с ростом размера становится чрезмерно запутанным: невозможно анализировать и развивать код отдельной функции, не держа в голове все глобальные переменные и все остальные функции, влияющие на них.

Всё необходимое для работы функции можно передать через параметры. Например, функция для рисования пакмана была объявлена так:

```cpp
void render(sf::RenderWindow & window, sf::CircleShape & shape)
{
    window.clear();
    window.draw(shape);
    window.display();
}
```

Но если отказаться от глобальных переменных, со временем могут возникнуть новые проблемы:

- код функции разрастается и становится неудобным для чтения
- число параметров функции возрастает
- возникает необходимость как-то возвращать из функции несколько значений

Первая проблема решается путём дальнейшего деления на вспомогательные функции. Остальные две проблемы можно решить с помощью составных типов данных, например, структур `struct` или контейнеров стандартной библиотеки C++. Синтаксис определения пользовательской структуры:

```cpp
// синтаксис (упрощённый)
struct Идентификатор
{
    Тип_поля_№1 имя_поля_№1;
    Тип_поля_№2 имя_поля_№2;
    // и так далее ...
};
// пример
struct Packman
{
    sf::CircleShape shape;
    Direction direction;
};
```

Обращение к полям структуры можно выполнить с помощью оператора ".":

```cpp
void initializePackman(Packman &packman)
{
    packman.direction = Direction::NONE;
    packman.shape.setRadius(20);
    packman.shape.setFillColor(sf::Color::Green);
    packman.shape.setPosition(100, 0);
}

// старое длинное определение без структур:
void initializePackman(sf::CircleShape & shape, Direction & direction)
{
    // ...
}
```

## Обработка событий клавиатуры

Библиотека SFML предлагает два способа обработки событий клавиатуры:

- Можно обработать событие в нажатия или освобождения клавиши; для этого надо использовать поле key у событий типов [sf::Event::KeyPressed, sf::Event::KeyReleased](www.sfml-dev.org/tutorials/latest/window-events.php#the-keypressed-and-keyreleased-events)
- Можно проверить, нажата ли какая-либо клавиша в данный момент времени; для этого следует воспользоваться статическим методом [sf::Keyboard::isKeyPressed](http://www.sfml-dev.org/documentation/2.0/classsf_1_1Keyboard.php#a80a04b2f53005886957f49eee3531599)

Мы могли воспользоваться вторым способом, проверяя состояние интересующей клавиши с помощью `sf::Keyboard::isKeyPressed` при обновлении состояния игры. Но на данном этапе мы всё же выберем первый способ и будем фиксировать как нажатие, так и освобождение клавиши самостоятельно (хотя `sf::Keyboard::isKeyPressed` по сути отслеживает то же самое).

Мы также применим инструкцию условного выполнения [switch (en.cppreference.com)](http://en.cppreference.com/w/cpp/language/switch), которая практически эквивалентна целой цепочке инструкций `if..else if..else`. Инструкция switch выполняет case-распознавание, сопоставляя некоторое вычисленное значение нескольким константам.

### Реализация handleEvents

```cpp
void handleEvents(sf::RenderWindow & window, Packman &packman)
{
    sf::Event event;
    while (window.pollEvent(event))
    {
        if (event.type == sf::Event::Closed)
        {
            window.close();
        }
        // в ветке else - проверка события "нажата клавиша"
        else if (event.type == sf::Event::KeyPressed)
        {
            // нажатие клавиши может привести пакмана в движение
            // остановить пакмана нельзя: он движется, пока не достигнет стены.
            switch (event.key.code)
            {
            case sf::Keyboard::Up:
                packman.direction = Direction::UP;
                break;
            case sf::Keyboard::Down:
                packman.direction = Direction::DOWN;
                break;
            case sf::Keyboard::Left:
                packman.direction = Direction::LEFT;
                break;
            case sf::Keyboard::Right:
                packman.direction = Direction::RIGHT;
                break;
            default:
                break;
            }
        }
    }
}
```

### Улучшенная версия handleEvents

После изменений функция handleEvents стала немного громоздкой. Она выполняет одновременно слишком много задач: циклическая выборка событий из очереди (скрытой внутри SFML), обработка события закрытия окна и обработка событий нажатия клавиши. Для удобства, выделим в `packman.h` и `packman.cpp` функцию handlePackmanKeyPress:

```cpp
// файл packman.h
// ... часть кода пропущена
bool handlePackmanKeyPress(const sf::Event::KeyEvent &event, Packman &packman);

// файл packman.cpp
// ... часть кода пропущена
bool handlePackmanKeyPress(const sf::Event::KeyEvent &event, Packman &packman)
{
    bool handled = true;
    switch (event.code)
    {
    case sf::Keyboard::Up:
        packman.direction = Direction::UP;
        break;
    case sf::Keyboard::Down:
        packman.direction = Direction::DOWN;
        break;
    case sf::Keyboard::Left:
        packman.direction = Direction::LEFT;
        break;
    case sf::Keyboard::Right:
        packman.direction = Direction::RIGHT;
        break;
    default:
        handled = false;
        break;
    }
    return handled;
}

// файл main.cpp
// ... часть кода пропущена
void handleEvents(sf::RenderWindow & window, Packman &packman)
{
    sf::Event event;
    while (window.pollEvent(event))
    {
        if (event.type == sf::Event::Closed)
        {
            window.close();
        }
        else if (event.type == sf::Event::KeyPressed)
        {
            handlePackmanKeyPress(event.key, packman);
        }
    }
}
```

### Обработка события "key released"

Нам следует обрабатывать событие окончания нажатия клавиши, чтобы останавливать персонажа. Однако, надо корректно обрабатывать ситуацию, когда одновременно нажато несколько клавиш. На первом этапе для этого достаточно отслеживать, какое направление имел персонаж — если оно соответствует клавише, мы останавливаем персонажа.

```cpp
/// В файле packman.cpp
bool handlePackmanKeyRelease(const sf::Event::KeyEvent &event, Packman &packman)
{
    bool handled = true;
    switch (event.code)
    {
    case sf::Keyboard::Up:
        if (packman.direction == Direction::UP)
        {
            packman.direction = Direction::NONE;
        }
        break;
    case sf::Keyboard::Down:
        if (packman.direction == Direction::DOWN)
        {
            packman.direction = Direction::NONE;
        }
        break;
    case sf::Keyboard::Left:
        if (packman.direction == Direction::LEFT)
        {
            packman.direction = Direction::NONE;
        }
        break;
    case sf::Keyboard::Right:
        if (packman.direction == Direction::RIGHT)
        {
            packman.direction = Direction::NONE;
        }
        break;
    default:
        handled = false;
        break;
    }

    return handled;
}

/// В файле main.cpp
void handleEvents(sf::RenderWindow & window, Packman &packman)
{
    sf::Event event;
    while (window.pollEvent(event))
    {
        // Кнопка закрытия окна
        if (event.type == sf::Event::Closed)
        {
            window.close();
        }
        // Клавиши управления пакманом
        else if (event.type == sf::Event::KeyPressed)
        {
            handlePackmanKeyPress(event.key, packman);
        }
        else if (event.type == sf::Event::KeyReleased)
        {
            handlePackmanKeyRelease(event.key, packman);
        }
    }
}
```

## Засекаем время

Операционная система не даёт гарантий, что при частоте 60 кадров в секунду интервал между рисованиями кадра составит ровно 1/60. При большой нагрузке отзывчивость компьютера может упасть, и частота станет труднопредсказуемой. Поэтому мы улучшим функцию main и функцию updatePackman, добавив отслеживание точного интервала времени, прошедшего с момента последнего обновления пакмана. Это время мы будем передавать в функцию updatePackman для более точного определения шага перемещения:

```cpp
const float PACKMAN_SPEED = 20.f; // 20 пикселей в секунду
const float step = PACKMAN_SPEED * elapsedTime;
```

### Изменения в main.cpp

```cpp
void update(sf::Clock &clock, Packman &packman)
{
    const float elapsedTime = clock.getElapsedTime().asSeconds();
    clock.restart();
    updatePackman(packman, elapsedTime);
}

// функция render

int main(int, char *[])
{
    sf::RenderWindow window(sf::VideoMode(800, 600), "Window Title");
    Packman packman;
    initializePackman(packman);

    sf::Clock clock;

    while (window.isOpen())
    {
        handleEvents(window, packman);
        update(packman, clock);
        render(window, packman);
    }

    return 0;
}
```

### Изменения в packman.cpp

```cpp
// ...часть кода пропущена
void updatePackman(Packman &packman, float elapsedTime)
{
    const float PACKMAN_SPEED = 20.f; // pixels per second.
    const float step = PACKMAN_SPEED * elapsedTime;
    sf::Vector2f position = packman.shape.getPosition();
    switch (packman.direction)
    {
    case Direction::UP:s
        position.y -= step;
        break;
    case Direction::DOWN:
        position.y += step;
        break;
    case Direction::LEFT:
        position.x -= step;
        break;
    case Direction::RIGHT:
        position.x += step;
        break;
    case Direction::NONE:
        break;
    }
    packman.shape.setPosition(position);
}
```

## Выделение констант

Теперь в файле packman.cpp выделим константы из функций в глобальные константы. Это позволяет объединить фрагменты программы, задающие конфигурацию пакмана, в одну череду констант.

В объявлениях глобальных констант мы добавим многоцелевое ключевое слово `static`. В контексте глобальных переменных и констант это слово влияет на процесс компоновки исполняемого файла. Константы с одинаковыми именами, объявленные в разных файлах, будут конфлитовать друг с другом и вызывать ошибки компоновки, если только не скрыть их от компоновщика. Но если добавить слово `static` (или поместить константу в анонимное пространство имён), то компоновщик даже не узнает о том, что константа с таким именем существовала в программе.

Теперь выделим константы в файле `packman.cpp`:

```cpp
#include "packman.h"

static const sf::Color PACKMAN_COLOR = sf::Color::Yellow;
static const float PACKMAN_SPEED = 20.f; // pixels per second.
static const sf::Vector2f PACKMAN_INITIAL_POSITION = {100, 0};

void initializePackman(Packman &packman)
{
    packman.direction = Direction::NONE;
    packman.shape.setRadius(20);
    packman.shape.setFillColor(PACKMAN_COLOR);
    packman.shape.setPosition(PACKMAN_INITIAL_POSITION);
}

void updatePackman(Packman &packman, float elapsedTime)
{
    const float step = PACKMAN_SPEED * elapsedTime;  
    // ... остальной код не изменился
```

### Далее

- [Третий пример](3.html)
- [Events Explained (sfml-dev.org)](http://www.sfml-dev.org/tutorials/2.4/window-events.php)
- [Keyboard, mouse and joystick (sfml-dev.org)](http://www.sfml-dev.org/tutorials/2.4/window-inputs.php)