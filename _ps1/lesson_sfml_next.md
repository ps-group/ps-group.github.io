---
title:  'Обработка событий. Интерактив.'
subtitle: 'В статье вы освоите обработку событий мыши и клавиатуры в мультимедийных программах и научитесь писать функции на языке С++'
preview: 'img/preview/sfml_4.png'
draft: true
---

## Летающие по столу шары

### Массивы в C++

Язык C++ имеет встроенную поддержку структуры данных "массив". Массив в C++ хранит коллекцию элементов одинакового типа, размер коллекции фиксируется при компиляции. Вы можете считать массив коллекцией переменных одного и того же типа.

Вместо создания отдельных переменных `shape1`, `shape2`, `shape3` вы объявляете одну переменную-массив `shapes`, хранящую объекты типа `sf::ConvexShape`, и используете выражения `shapes[0]`, `shapes[1]` для доступа к элементам массива. Индексация всегда начинается с нуля, а последний доступный индекс на единицу

To declare an array in C++, the programmer specifies the type of the elements and the number of elements required by an array as follows −

```cpp
type arrayName [ arraySize ];

double balance[10];
```

### Initializing Arrays

You can initialize C++ array elements either one by one or using a single statement as follows −

```cpp
double balance[5] = {1000.0, 2.0, 3.4, 17.0, 50.0};

balance[4] = 50.0;

double salary = balance[9];
```

### Выход за границы массива
