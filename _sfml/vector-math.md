---
title: "Векторная алгебра в SFML"
---

В [sf::Vector2f](http://www.sfml-dev.org/documentation/2.0/classsf_1_1Vector2.php) и sf::Vector2i удобно хранить двумерные физические величины
- положение, расстояние или перемещение (т.е. точку или вектор перемещения)
- скорость (вместе с направлением движения)
- ускорение (вместе с направлением движения)
- размеры ограничивающего прямоугольника (a.k.a. bounding box)

Некоторые полезные возможности уже поддерживаются в SFML. Другие придётся разработать самостоятельно.

### Идиома &laquo;хранилище функций&raquo;
Для математики стоило бы завести отдельную пару файлов ```GameMath.h``` и ```GameMath.cpp```. Но тут есть грабли. Объясним на примере:
- GameMath.h (обратите внимание, в названиях функций нет глаголов — такое исключение делается для математических функций)
```cpp
#pragma once

sf::Vector2f Normalized(sf::Vector2f value);
sf::Vector2f Cartesian(float radius, float angle);
```
- GameMath.cpp

```cpp
#include "GameMath.h"

sf::Vector2f Normalized(sf::Vector2f value)
{
    // ...
}

sf::Vector2f Cartesian(float radius, int angle)
{
    // ...
}
```
Код нормально скомпилируется, но при попытке использовать Cartesian компоновщик (linker) выдаст ошибку категории 'unresolved symbol'. Причина проста: в заголовке функция Cartesian описана как принимающая 2 числа float, а в cpp как принимающая float и int. Для компилятора это разные функции из-за перегрузки функций.

Для защиты от этих ошибок есть простое решение: структура со статическими методами:

- GameMath.h
```cpp
#pragma once

struct Math()
{
    // protect from suspicious creation.
    Math() = delete;

    static sf::Vector2f Normalized(sf::Vector2f value);
    static sf::Vector2f Cartesian(float radius, float angle);
```
- GameMath.cpp
```cpp
#include "GameMath.h"

sf::Vector2f Math::Normalized(sf::Vector2f value)
{
    // ...
}

sf::Vector2f Math::Cartesian(float radius, float value)
{
    // ...
}
```
- как использовать:
```cpp
sf::Vector2f normal = Math::Normalized(unit.distance);
```

### Часто употребляемые функции
- функция Cartesian для перевода из полярной системы координат в прямоугольную (декартову). Эта функция, например, позволяет получить двумерную скорость движения из модуля скорости в виде числа и направления движения в виде угла.
```cpp
sf::Vector2f Math::Cartesian(float radius, float angle)
{
    float radians = ToRadian(angle);
    // SFML allows to multiply sf::Vector2f on float.
    return sf::Vector2f{cosf(radians), sinf(radians)} * radius;
}
```
- функция ```float ToRadian(float angle)``` для перевода величины угла из градусов в радианы
- функция ```float ToDegree(float angle)``` для перевода величины угла из радианов в градусы
- функция ```float Sign(float value)```, возвращающая -1 для отрицательных чисел, 0 для нуля и 1 для положительных
- функция ```int Random(int max)```, возвращающая случайное число от 0 до max (включая либо не включая max)
- функция ```float Distance(sf::Vector2f from, sf::Vector2f to)``` для определения расстояния между двумя точками
- функция ```sf::Vector2f Normalized(sf::Vector2f vec)``` для получения вектора с тем же направлением и единичной длиной. Такой вектор называется нормаль (орт), при умножении его на абсолютную скорость юнита и на время мы получим перемещение юнита за данный промежуток времени.
- функция ```float PolarAngle(sf::Vector2f vec)```, которая превращает вектор направления в угол в градусах (или радианах).

### Читать далее
- [контракты функций](design-by-contract.html)
- [линейная алгебра для программистов (habrahabr.ru)](http://habrahabr.ru/post/131931/)
- [механизм перегрузки функций (cplusplus.com)](http://www.cplusplus.com/doc/tutorial/functions2/)
