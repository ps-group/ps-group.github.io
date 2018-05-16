---
title: "C++: осваиваем std::remove_if с лябмда-функциями"
---

Правильно удалять элементы из контейнера или изменять размер контейнера &mdash; задача самого программиста, за исключением случаев, когда подходящий способ удаления уже есть в виде метода класса (например, [std::list remove_if](http://en.cppreference.com/w/cpp/container/list/remove)).

Свободные функции std::remove и std::remove_if объявлены в заголовке `<algorithm>`. Обе функции предназначены для удаления элементов из контейнера, и обе являются только частью полного механизма удаления.

>*Предупреждение:* функции std::remove и std::remove_if не удаляют элементы из контейнера, они только перемещают или копируют элементы внутри контейнера, но никогда не изменят размер контейнера, поскольку у них нет информации о внутреннем устройстве контейнера.

Реализация remove_if в стандартной библиотеке могла бы выглядеть следующим образом:

```cpp
// Параметр-тип ForwardIt - итератор, указывающий на начало или конец области в контейнере
// Параметр-тип UnaryPredicate - предикат, который должен вернуть true,
//  если очередной элемент надо удалить.
template<class ForwardIt, class UnaryPredicate>
ForwardIt remove_if(ForwardIt first, ForwardIt last, UnaryPredicate p)
{
    first = std::find_if(first, last, p);
    if (first != last)
        for(ForwardIt i = first; ++i != last; )
            if (!p(*i))
                *first++ = std::move(*i);
    return first;
}
```

Функции remove и remove_if выполняют стабильную операцию, то есть порядок оставшихся в коллекции элементов сохраняется таким же, каким был. Удалённые элементы помещаются в конец контейнера.

## std::remove_if и лямбда

Пришло время разобраться, как использовать remove_if с лямбда-функцией в качестве предиката (который должен вернуть true, если данный элемент следует удалить).

Будем выполнять операции над динамическим массивом целых чисел.

* С помощью remove_if мы отфильтруем все числа больше 3
    * После фильтрации мы получим *итератор*, указывающий на первый элемент после последнего уцелевшего элемента
    * Размер массива пока ещё не изменился, поэтому у нас есть итератор на начало удаляемой области диапазона
* С помощью метода erase мы удалим все элементы от первого элемента удаляемой области до последнего элемента массива

```cpp
#include <vector>
#include <algorithm>
#include <iostream>

int main()
{
    std::vector<int> numbers{ 2, 6, 3, 7, 4, 1, 1 };
    // Фильтруем элементы, перемещая уцелевшие элементы в начало массива
    auto newEnd = std::remove_if(numbers.begin(), numbers.end(), [](int num) {
        return num > 3;
    });
    // Удаляем все элементы, следующие после
    numbers.erase(newEnd, numbers.end());
    for (int num : numbers)
    {
        std::cout << num << "\n";
    }
}
```

Если скомпилировать и запустить пример, вы получите вывод четырёх чисел, больших числа 3

```
2
3
1
1
```

Как это произошло? Разберём подробнее

 With a vector of ints, we can inspect the vector before and after the two steps.
 `// Vector with numbers, initialized with an initializer list``std::vector<``int``> numbers{ 1,1,2,3,4,5,6 };` At this step, the contents of the vector looks like this.
    Original vector 1 1 2 3 4 5 6    Then we decide we want to filter out some values, say any value less  than 3 must be removed. For this we can use std::remove_if. It will do  what you asked for, except you must combine it with an explicit erase of  the container. Why will be explained later.
 The lambda expression looks like this. It has the same argument as the vector value type (int).
 `// Lambda for removing numbers less than 3``auto` `removeNumbers = [&](``int` `number) -> ``bool``{``    ``return` `number < 3;``};` Call std::remove_if with the lambda as predicate.
 `// Call std::remove_if and obtain iterator``auto` `iterator = std::remove_if(numbers.begin(), numbers.end(), removeNumbers);` After remove_if, the vector will look like this.
    Original vector 1 1 2 3 4 5 6   After remove_if 3 4 5 6 4 5 6    Red numbers are removed, green are kept, while gray numbers are surplus.
 To remove the elements, we will have to call erase on the vector.
 `numbers.erase(iterator, numbers.end());` The arguments for erase is a range of elements to be removed.
    Original vector 1 1 2 3 4 5 6   After remove_if 3 4 5 6 4 5 6   After erase 3 4 5 6 
 
 
    Here is a graphical presentation of the vector.
 [![std_remove_if](/wp-content/uploads/2015/10/std_remove_if-300x163.png)](http://studiofreya.com/wp-content/uploads/2015/10/std_remove_if.png)
   
## Why remove_if can’t delete from the container

 The simple answer: It’s not possible.
 The longer answer: The arguments for std::remove_if doesn’t include  the container type. It only includes an iterator range and a predicate  (or value in the case of std::remove). The method itself doesn’t know  about the underlying storage. If and only if remove_if were limited to  vector or list, then it would have been possible to actually remove  elements. But that is not the case.
 It’s possible to create iterators from a regular array, and it’s not  possible to resize an array without reallocating memory, thus copying  (or moving) elements from the old array to the new array.
 That’s why std::remove and std::remove_if doesn’t actually remove elements, it only moves elements to be kept.
 One other thing to remember is that removed elements will be  destroyed. After remove_if, there may or may not be usable data in the  area after the iterator returned by the method.
 
## Practical use for remove_if

 The most practical use for remove and remove_if is to remove elements from a range.
 With some collections counting millions of elements, it’s not  feasible to remove one element at a time. With a logical deleted tag,  it’s possible to remove all elements with linear complexity, also known  as O(n).
 The rationale of using std::remove_if is simple. If you’re deleting  10000 elements from a vector containing 1 million elements, you will, in  the worst case scenario, move or copy most elements 10000 times. With 1  million elements, it will be close to 10 billion copies or moves.
 Here is one example. Widget is an example struct for some user supplied type.

 ```cpp
struct Widget {
    std::string name; // Имя элемента интерфейса
    bool deleted; // Пришло время удалить элемент?
};

// Объявляем контейнер, заполняем его данными
std::vector<Widget> widgets;
widgets.emplace_back(Widget{ "W1", true });
widgets.emplace_back(Widget{ "W2", true });
widgets.emplace_back(Widget{ "W3", false });
widgets.emplace_back(Widget{ "W4", true });
widgets.emplace_back(Widget{ "W5", false });
widgets.emplace_back(Widget{ "W6", true });
widgets.emplace_back(Widget{ "W7", true });
widgets.emplace_back(Widget{ "W8", false });
```
 
 The data will look like this in the vector.

```
Original ‘W1’=true ‘W2’=true ‘W3’=false ‘W4’=true ‘W5’=false ‘W6’=true ‘W7’=true ‘W8’=false
```

After std::remove_if, the vector will still have the same size, but  notice how the move operator have actually moved the string names from  the end of the vector to the beginning of the vector. This is most  apparent with W5 and W8. The corresponding value after is an empty  string.
Original ‘W1’=true ‘W2’=true ‘W3’=false ‘W4’=true ‘W5’=false ‘W6’=true ‘W7’=true ‘W8’=false   After remove_if ‘W3’=false ‘W5’=false ‘W8’=false ‘W4’=true ”=false ‘W6’=true ‘W7’=true ”=false    After erase, the vector have been resized to contain only non-deleted elements.
Original ‘W1’=true ‘W2’=true ‘W3’=false ‘W4’=true ‘W5’=false ‘W6’=true ‘W7’=true ‘W8’=false   After remove_if ‘W3’=false ‘W5’=false ‘W8’=false ‘W4’=true ”=false ‘W6’=true ‘W7’=true ”=false   After erase ‘W3’=false ‘W5’=false ‘W8’=false
```
