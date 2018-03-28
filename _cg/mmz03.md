---
title: "Комплексное задание на Qt: массовые столкновения"
subtitle: "Теперь мы напишем программу, в которой разноцветные шарики будут непрерывно летать, сталкиваясь друг с другом"
preview: "img/small/mmz03.png"
---

Эти задания надо выполнять, разделившись на пары (или тройки). Первые два задания придётся сделать за одним компьютером, последующие удобнее делать параллельно, используя github.

## Задание cg3.1

**Задание:** взять код из предыдущего занятия и сделать рефакторинг, выделив класс "Ball", который абстрагирует мяч со всеми его параметрами (такими как размер, скорость, местоположение шарика)

Каждый метод класса должен выполнять одну понятную операцию, не нарушая инкапсуляцию данных (позволяющую выдерживать инвариант класса).

* Например, будет удобно ввести метод `move(float dt)`, который принимает дробное число секунд и перемещает шарик с учётом данного интервала времени, собственной скорости и текущего местоположения шарика.
* Размер шарика удобнее передавать в конструктор
* Отталкивание от стенок лучше обрабатывать извне класса, т.к. в классе Ball для этого недостаточно информации (нет прямоугольника, описывающего границы мира)
    * Возможно, будет удобно ввести метод для получения прямоугольника, в который вписан шарик

![Скришнот](img/2d/00_rasterwindow_bouncing.gif)

## Задание cg3.2

>Перед выполнением задачи советуем прочитать статью [Массивы в C++](/cxx/cxx_arrays). Вы можете использовать инициализацию массива при объявлении, чтобы сделать код более аккуратным и читаемым.

Напишите программу, в которой несколько разноцветных шаров (количество фиксировано при компиляции) летают в пределах окна, отталкиваясь от стенок

* шарам не нужно сталкиваться между собой
* цвета и начальные скорости шаров задаются прямо в коде без какого-либо механизма случайностей
* для хранения множества шариков вы можете использовать массив либо `std::vector`

![Иллюстрация](img/labor/multiple_balls.png)

## Задание cg3.3

Добавьте шарам возможность отталкиваться друг от друга.

Для обнаружения столкновений достаточно сравнить все возможные пары шаров: если расстояние между центрами меньше суммы радиусов, шары сталкиваются. Перебрать каждую пару объектов ровно один раз можно с помощью вложенного цикла:

```cpp
constexpr size_t SIZE = 100;
Ball balls[SIZE];

// Перебираем каждую пару объектов
//  - ни одну пару не используем дважды
//  - не используем пары из одного объекта (т.е. объект не сталкивается сам с собой)
for (size_t fi = 0; fi < SIZE; ++fi)
{
    for (size_t si = fi + 1; si < SIZE; ++si)
    {
        // проверяем столкновение fi, si
    }
}
```

Такой цикл среди всех возможных сочетаний элементов переберёт только пары разных элементов, и ни одну пару не переберёт дважды:

![Иллюстрация](img/labor/for-each-pair.png)

При расчёте скоростей после удара важны скорости шаров до удара и взаимное положение их центров (при условии, что массы шаров равны). Это проиллюстрировано рисунке:

![Иллюстрация](img/labor/balls_collision.gif)

Считайте, что шары имеют одинаковую массу, а столкновение абсолютно упругое. В этом случае скорости шаров после удара вычисляются так, как показано на схеме:

![Схема](img/labor/balls_collision.png)

## Задание cg3.4: проверим, что всё работает правильно

С помощью инструкции [assert](http://en.cppreference.com/w/cpp/error/assert) добавьте проверку соблюдения законов сохранения энергии и импульса при проверке столкновений:

* закон сохранения энергии (уравнение умножено на 2): `m1 * v1^2 + m2 * v2^2 = m1 * w1^2 + m2 * w2^2`
    * v1, v2 - скорости до столкновения
    * w1, w2 - скорости после столкновения
     m1, m2 - массы шариков
* закон сохранения импульса: `m1 * v1 + m2 * v2 = m1 * w1 + m2 * w2`
* можно считать, что все массы равны константе либо вычисляются как произведение константы и `R^3`, где R - радиус шара

Проверка через assert должна выполняться после расчёта отталкивания очередной пары шариков.

Сравнивать числа с плавающей точкой через `==` не стоит: при вычислениях возможны погрешности, из-за которых ожидаемое и реальное значение будут равны лишь приблизительно. Для сравнения лучше проверить, что разница между числами не превышает `0.01`:

```cpp
#include <cmath>

bool areFuzzyEqual(float a, float b)
{
    constexpr float tolerance = 0.01f;
    const bool areEqual = (std::abs(a - b) < tolerance);

    return areEqual;
}
```

Однако, при проверке закона сохранения энергии может возникнуть проблема: если скорости будут достаточно велики, то разница между квадратами скоростей может превысить `0.01`. В этом случае разумно проверять относительную погрешность, а не абсолютную. С другой стороны, для чисел вблизи нуля относительная погрешность может быть большой даже в нормальной ситуации. Например, относительная погрешность между `0.00001` и `0` бесконечно велика. Поэтому лучше всего комбинировать расчёт относительной и абсолютной погрешностей.

Мы можем доработать функцию areFuzzyEqual, чтобы выбирать между относительной и абсолютной погрешностями в зависимости от величины чисел:

```cpp
#include <cmath>

// Сравнение с допустимой абсолютной погрешностью
bool areCloseAbsolute(float a, float b, float tolerance = 0.001f)
{
    return std::abs(a - b) < tolerance;
}

// Сравнение с допустимой относительной погрешностью
bool areCloseRelative(float a, float b, float tolerance = 0.001f)
{
    return std::abs((a - b) / b) < tolerance;
}

// Сравнение двух чисел с плавающей точкой с допустимой погрешностью 0.001
bool areFuzzyEqual(float a, float b)
{
    constexpr float tolerance = 0.001f;
    if (std::abs(b) > 1.f)
    {
        return areCloseRelative(a, b, tolerance);
    }
    return areCloseAbsolute(a, b, tolerance);
}
```

## Задание cg3.5

>Перед выполнением задачи советуем прочитать статью [Генерация случайных чисел в Modern C++](/cxx/cxx_random).

Добавьте случайную генерацию скоростей для шаров. Скорости не должны быть слишком большими или слишком маленькими: при генерации случайных чисел надо задать разумные ограничения. Для скоростей можно использовать обычное линейное распределение вероятностей.

## Задание cg3.6

Добавьте возможность создавать шар со случайным цветом и скоростью по клику левой кнопкой мыши.

* шар не должен создаваться, если после создания он бы сразу пересёкся с другим шаром (другими словами, нельзя создать шар над другим шаром)
* для хранения динамического массива шаров вам не подойдёт массив в стиле `Ball balls[...]`, используйте `std::vector`

Случайный цвет можно получить либо случайной генерацией RGB-компонентов и последующим конструированием QColor, либо смешиванием компонентов предопределённых цветов. 

## Задание cg3.7

Добавьте шарикам время жизни: каждый шар после создания существует ровно 10 секунд, после чего исчезает.

* счётчик оставшегося времени жизни лучше держать в классе Ball
* удаление отживших своё элементов массива шаров можно выполнять с помощью идиомы `remove_if + erase`; изучите, как эта идиома реализуется в C++, и используйте её
* удаление отживших своё элементов удобнее выделить в функцию removeDeathBalls, обновление времени жизни всех шаров удобно выделить в функцию updateBallLifetimes

>Хорошая статья: [C++ std::remove_if with lambda explained](https://studiofreya.com/cpp/std-remove_if-with-lambda/)

## Задание cg3.8 (дополнительное)

Могут возникать ситуации, когда шарики под воздействием других шариков "заталкиваются" друг в друга:

![Скриншот](img/labor/balls_endless_collision.jpg)

Причина проста: длительность кадров различается, и если один кадр длился долго, то шарики могли достаточно глубоко пересечься, прежде чем их столкновение будет обработано. Обработка столкновения приведёт к тому, что скорости шариков окажутся направлены в разные стороны. На следующем кадре они не успеют полностью разойтись, и программа решит, что произошло новое столкновение. Скорости сменят направление, и шарики вновь полетят навстречу друг другу:

![Иллюстрация](img/labor/sticked_balls.png)

Решить эту проблему можно, если в процедуре update интервал каждого кадра разделить на 5-10 небольших интервалов, и на каждом из этих маленьких интервалов выполнять полный расчёт физики. Уменьшение временных интервалов при расчётах физики уменьшит вероятность заталкивания, т.к. за один интервал шарики будут передвигаться на меньшее расстояние.

>При таком решении производительность не пострадает: если у вас меньше 1000-10000 шариков, то рисование шариков всё равно будет занимать больше ресурсов процессора, чем расчёт физики. Только на большом числе шариков квадратичная сложность попарного перебора окажет заметное влияние.