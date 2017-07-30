---
title: "Обработка массивов и списков"
---

Рассмотрим, как обрабатывать массивы и списки. Статья подходит для коллекций std::vector и std::list.

### Обход std::vector в старом стиле
Допустим, есть массив с числами: ```std::vector<int> numbers = {11, 2, -3, 51, 80, -15};```

Первая задача — напечатать все числа в консоль. Известное, универсальное для многих языков решение — индексы.
```cpp
int i;
for (i = 0; i < 6; ++i)
{
    printf("#%d: %d\n", i, numbers[i]);
}
```
В консоли получим:
```bash
#0: 11
#1: 2
#2: -3
#3: 51
#4: 80
#5: -15
```
Но у опытного программиста возникнет ряд вопросов
- почему i объявлена на отдельной строке? Переменные лучше объявлять там, где они используются, то есть в условии цикла for.
- почему i имеет тип int - разве размер массива бывает отрицательным? Разве максимальная длина std::vector ограничена диапазоном int, даже на 64-битных системах?
- почему от 0 до 6? Если я изменю размер массива numbers в одном месте, я должен везде искать 6 и заменять? А если в другой ветке git был написан код, в котором также используется число 6 — я ведь не смогу изменить 6 на 7, потому что просто не замечу этой проблемы при merge. Что делать?
Перепишем код
```cpp
for (size_t i = 0; i < numbers.size(); ++i)
{
    printf("#%d: %d\n", i, numbers[i]);
}
```

Есть другое решение: итераторы вместо индексов. Итератор не является числом, но он заменяет собой индексы. Интерфейс итератора прост: его можно увеличить, уменьшить и сравнить с другим итератором. Реализованы итераторы с помощью ООП и обобщённого программирования, но так ли важно знать реализацию, если программный интерфейс работает хорошо?
- переменные-итераторы для std::vector<int> имеют тип ```std::vector<int>::iterator```, но это очень длинная и бесполезная запись. Поскольку переменная-итератор создаётся в условии for, то компилятор может сам определить её тип из выражения-инициализатора; для запуска механизма автовывода типа достаточно использовать ключевое слово auto.

```cpp
for (auto it = numbers.begin(); it != numbers.end(); ++it)
{
    int i = *it;
    printf("number: %d\n", numbers[i]);
}
```
Теперь вывод стал проще:

Так для чего нужны итераторы? Например, для перебора в обратном порядке:
- begin/end меняются на rbegin/rend.
```cpp
for (auto it = numbers.rbegin(); it != numbers.rend(); ++it)
{
    int i = *it;
    printf("number: %d\n", numbers[i]);
}
```

### Перебор коллекции с range for

В современном C++ есть средства покруче индексов и итераторов. Они, кстати, реализованы с помощью итераторов. Таких средства два:
- на уровне языка есть range for
- на уровне библиотеки STL есть десятки функций из &lt;algorithm&gt;

range-for помогает перебрать элементы коллекции в прямом порядке
```cpp
std::vector<int> numbers = {11, 2, -3, 51, 80, -15};
for (int n : numbers)
{
    printf("number: %d\n", n);
}
```
можно обходить C-style массивы, а не только коллекции из STL
```cpp
int numbers[] = {11, 2, -3, 51, 80, -15};
for (int n : numbers)
{
    printf("number: %d\n", n);
}
```
чтобы изменять элементы std::vector, можно перебирать элементы по ссылке
```cpp
std::vector<int> numbers = {11, 2, -3, 51, 80, -15};
for (int &n : numbers)
{
    n += 1;
}
```
можно использовать auto или auto& вместо явного указания типа
```cpp
std::vector<Shape *> shapes = {shapeTriangle, shapeCircle, shapeRect};
for (auto shape : shapes)
{
    window.draw(*shape);
}
```

### Замена while/for на вызов функций
В &lt;algorithm&gt; объявлен целый ряд функций, позволяющих обработать коллекцию поэлементно вообще без циклов. Цикл находится внутри таких функций, а программист лишь передаёт функцию для обработки одного элемента. В чём смысл такой замены? А давайте посмотрим три примера:
- Определяем количество нулей в коллекции
```cpp
// std::vector<int> numbers = {11, 2, -3, 51, 80, -15};

int count_zeros(std::vector<int> const& numbers)
{
    int count = 0;
    for (int n : numbers)
    {
        if (n == 0)
        {
            count += 1;
        }
    }
    return count;
}
```
- Определяем, содержит ли коллекция хотя бы одно нечётное число.
```cpp
// std::vector<int> numbers = {11, 2, -3, 51, 80, -15};

bool has_any_odd(std::vector<int> const& numbers)
{
    for (int n : numbers)
    {
        if (n % 2 == 1)
        {
            return true;
        }
    }
    return false;
}
```
- Удаляем из коллекции отрицательные числа. Мы не можем применить range for, потому что коллекцию надо изменять по мере обхода.
```cpp
// std::vector<int> numbers = {11, 2, -3, 51, 80, -15};

void remove_negative(std::vector<int> &numbers)
{
    for (auto it = numbers.begin(); it != numbers.end())
    {
        int n = *it;
        if (n < 0)
        {
            it = numbers.erase(it);
        }
        ++it;
    }
}
```

Результат: во всех трёх примерах используется for, и во всех трёх по-разному. Программисту, читающему код, придётся внимательно изучать каждый цикл
- происходит ли преждевременный выход через return, break?
- происходит ли перескок на элемент вперёд/назад через изменение индекса, изменение итератора или continue?
- корректно ли построен алгоритм обхода?
Чем дольше растёт код проекта, тем больше в нём разных по смыслу циклов for. На помощь приходит &lt;algorithm&gt;.

#### Переписываем с &lt;algorithm&gt;
- Определяем количество нулей в коллекции. См. http://en.cppreference.com/w/cpp/algorithm/count
```cpp
// std::vector<int> numbers = {11, 2, -3, 51, 80, -15};

int count_zeros(std::vector<int> const& numbers)
{
    return std::count(numbers.begin(), numbers.end(), 0);
}
```
- Определяем, содержит ли коллекция хотя бы одно нечётное число.
```cpp
// std::vector<int> numbers = {11, 2, -3, 51, 80, -15};
bool is_odd(int number)
{
    return (number % 2 == 1);
}

bool has_any_odd(std::vector<int> const& numbers)
{
    return std::any_of(numbers.begin(), number.end(), is_odd);
}

```
- Удаляем из коллекции отрицательные числа. Мы не можем применить range for, потому что коллекцию надо изменять по мере обхода.
```cpp
// std::vector<int> numbers = {11, 2, -3, 51, 80, -15};
bool is_negative(int number)
{
    return (number < 0);
}

void remove_negative(std::vector<int> &numbers)
{
    auto new_end = std::remove_if(numbers.begin(), numbers.end(), is_negative);
    numbers.erase(new_end, numbers.end());
}
```

Результат: программисту больше не нужно анализировать цикл for, всё сводится к понятным опытному разработчику примитивным функциям из &lt;algorithm&gt;. Эти функции принимают одинаковые наборы параметров, но по-разному реализуют цикл for внутри своей реализации. Появились новые проблемы:
- появились лишние функции 'is_odd', 'is_negative', которые замусорят новыми именами глобальную область видимости и отвлекут программиста
- как вы будете действовать в ситуации, когда функции, обрабатывающей элемент коллекции, нужна дополнительная информация? В примере ниже будет ошибка компиляции, потому что доступа к параметру 'scene' в функции 'detect_dead' нет:
```cpp
bool detect_dead(const Entity &entity)
{
    if (!entity.alive)
    {
        entity.onDeath(scene);
        return true;
    }
    return false;
}

void update_and_clean(GameScene &scene, std::vector<Entity> &entities)
{
    auto new_end = std::remove_if(entities.begin(), entities.end(), detect_dead);
    entities.erase(new_end, entities.end());
}
```

#### std::bind и лямбды
В стандарте C++ от 2011-го года появились удобнейшие элементы функционального программирования, которые решают данную задачу, причём разными способами.
- первый способ использует std::bind, и по-прежнему выделяет отдельную функцию detect_dead
```cpp
bool detect_dead(GameScene &scene, const Entity &entity)
{
    if (!entity.alive)
    {
        entity.onDeath(scene);
    }
    return !entity.alive;
}

void update_and_clean(GameScene &scene, std::vector<Entity> &entities)
{
    std::function<bool(const Entity &)> remover = std::bind(detect_dead, std::ref(scene), std::placeholders::_1);
    auto new_end = std::remove_if(entities.begin(), entities.end(), detect_dead);
    entities.erase(new_end, entities.end());
}
```
- второй способ убирает длинное объявление 'std::function<...>' благодаря auto.
```cpp
// [...]

void update_and_clean(GameScene &scene, std::vector<Entity> &entities)
{
    auto remover = std::bind(detect_dead, std::ref(scene), std::placeholders::_1);
    auto new_end = std::remove_if(entities.begin(), entities.end(), remover);
    entities.erase(new_end, entities.end());
}
```
- третий способ использует лямбда-функцию, в результате код для обработки элемента коллекции лежит внутри функции 'update_and_clean', что очень логично для читающего код.
```cpp
void update_and_clean(GameScene &scene, std::vector<Entity> &entities)
{
    // '&scene' captures scene parameter into lambda function.
    auto detect_dead = [&scene](const Entity &entity) {
        if (!entity.alive)
        {
            entity.onDeath(scene);
        }
        return !entity.alive;
    };
    auto new_end = std::remove_if(entities.begin(), entities.end(), detect_dead);
    entities.erase(new_end, entities.end());
}
```

### Читать далее
- документация по &lt;algorithm&gt;: http://en.cppreference.com/w/cpp/algorithm
- спецификация лямбда-функций: http://en.cppreference.com/w/cpp/language/lambda
