---
title: 'Миграция на повседневный C++17'
redirect_from: "/compilers/cxx17"
---

В статье показаны практичные приёмы, которые открыл для нас C++17. В целом в новом стандарте не хватает многих ожидаемых вещей: модулей, концептов, рефлексии, сопрограмм. Тем не менее, стандарт упростил некоторые задачи метапрограммирования и некоторые повседневные задачи. О метапрограммировании и других экспертных темах мы говорить не будем — лучше поговорим о том, как улучшился повседневный язык.

## Ключевые советы

Гайдлайны хорошего стиля:

- используйте декомпозицию при объявлении переменных: `auto [a, b, c] = std::tuple(32, "hello"s, 13.9)`
    - возвращайте из функции структуру или кортеж вместо присваивания out-параметров
- в параметрах всех функций и методов вместо `const string&` принимайте невладеющий `string_view` по значению
    - возвращайте владеющий string, как и раньше
- завершайте все блоки case, кроме последнего, либо атрибутом `[[fallthrough]]`, либо инструкцией `break;`
- смело пишите `auto object = Class(a, b, c, ...);`
    - в C++17 гарантировано не произойдёт ни копирования, ни перемещения независимо от перегрузок конструкторов класса
- избегайте вложенности пространств имён, а если не избежать, то объявляйте их с помощью `namespace product::account::details`

Гайдлайны по STL:

- предпочитайте `optional<T>` вместо `unique_ptr<T>` для композиции объекта T, время жизни которого короче времени жизни владельца
    - для PIMPL используйте `unique_ptr<Impl>`, потому что определение Impl скрыто в файле реализации класса
- используйте тип `variant` вместо enum или полиморфных классов в ситуации, когда состояния, такие как состояние лицензии, не могут быть описаны константами enum из-за наличия дополнительных данных
- используйте тип `variant` вместо enum в ситуации, когда данные, такие как код ошибки в исключении, должны быть обработаны во всех вариантах, и неполная обработка вариантов должна приводить к ошибке компиляции
- используйте тип `variant` вместо any везде, где это возможно
- предпочитайте `std::filesystem` вместо boost::filesystem
- используйте [to_chars](http://en.cppreference.com/w/cpp/utility/to_chars) и [from_chars](http://en.cppreference.com/w/cpp/utility/from_chars) для реализации библиотечных функций сериализации и парсинга чисел
    - не используйте их напрямую: рискуете сделать небрежную обработку ошибок
- используйте [std::size](http://en.cppreference.com/w/cpp/iterator/size) для измерения длины C-style массива

## Доклады с конференций

- [Антон Полухин. C++17 (C++ SIBERIA 2016)](http://cpp-russia.ru/?page_id=1253)
- [Алексей Малов. Применение современного C++ в повседневной работе](https://www.youtube.com/watch?v=MKupBSQxguA)

## Таблицы поддержки C++17 в компиляторах

- [Ядро языка и реализация STL в Microsoft C++ Compiler](https://docs.microsoft.com/en-us/cpp/visual-cpp-language-conformance)
- [Ядро языка в LLVM/Clang](https://clang.llvm.org/cxx_status.html)
- [Реализация STL от LLVM/Clang - libc++](https://libcxx.llvm.org/cxx1z_status.html)
- [Ядро языка в GCC](https://gcc.gnu.org/projects/cxx-status.html)
- [Реализация STL от GCC - libstdc++](https://gcc.gnu.org/onlinedocs/libstdc++/manual/status.html)

## Новый модуль std::filesystem

Знаменитая библиотека Boost.Filesystem мигрировала в стандарт, и теперь будет реализована производителями компиляторов в пространстве имён [std::filesystem](http://en.cppreference.com/w/cpp/filesystem). Это радует, потому что Boost.Filesystem имеет известные проблемы внутренней архитектуры:

- внутри Boost.Filesystem присутствуют места с неопределённым поведением, например, разыменование нулевых указателей и передача их в виде ссылки, а затем повторное получение указателя
- на Windows в некоторых случаях, например внутри функции exist, используются конвертации в 8-битные кодировки, что приводит к проблемам при работе с путями, содержащими определённые символы Unicode

## Новые типы данных

### Тип данных std::byte

Появился новый тип данных `std::byte`, который занимает ровно один байт и замещает `char` / `unsigned char`, предлагая более строгую и семантически правильную типизацию. Объявление типа выглядит примерно так:

```cpp
namespace std
{ 
    enum class byte : unsigned char {};   
}
```

### Тип данных string_view

В C++17 появился шаблон `std::basic_string_view<T>` и специализации string_view, wstring_view. Ранее они встречались:

- в библиотеках Boost под именем string_ref (переименован в string_view в последних версиях)
- в проектах LLVM и Chromium под именами StringRef и StringPiece соответственно

Совет: в C++17 в параметрах всех функций и методов вместо `const string&` принимайте невладеющий `string_view`, но возвращайте владеющий string.

```cpp
// старый стиль - до c++17
std::wstring utf8_to_wstring(const std::string &str)
{
    std::wstring_convert<std::codecvt_utf8<wchar_t>> myconv;
    return myconv.from_bytes(str);
}

// новый стиль - c++17
std::wstring utf8_to_wstring(std::string_view str)
{
    std::wstring_convert<std::codecvt_utf8<wchar_t>> myconv;
    return myconv.from_bytes(str);
}
```

Особенности string_view:

- он не владеет данными, но предоставляет интерфейс, аналогичный `const std::string &`
- размер string_view равен двум размерам указателя, его легко передать по значению или скопировать
- string_view имеет конструкторы из `string`, `char*`, `char[SIZE]`
- в `std::string` используется оптимизация коротких строк (SSO), из-за чего доступ к элементам строки по индексу каждый раз приводит к одной проверке с `if`. В string_view такой проверки нет, и доступ к элементам прямой — это немного повышает производительность.
- единственные модифицирующие операции над string_view — [remove_prefix](en.cppreference.com/w/cpp/string/basic_string_view/remove_prefix) и [remove_suffix](http://en.cppreference.com/w/cpp/string/basic_string_view/remove_suffix), которые отсекают от видимого диапазона string_view заданное число символов с начала или с конца; исходная строка не меняется, а меняется только наблюдаемый диапазон
- в стандартной библиотеке добавлен литерал ""sv, конструирующий string_view.

![Иллюстрация](img/string_view.png)

### Тип данных optional

Известный тип данных optional из Boost мигрировал в стандарт под именем `std::optional`. Мы не будем описывать класс в этой статье, отметим лишь основные особенности:

- optional имеет `operator*` и `operator->`, а также удобный метод `.value_or(const T &defaultValue)`

```cpp
// nullopt - это специальное значение типа nullopt_t, которое сбрасывает
//  значение optional (аналогично nullptr для указателей)
std::optional<int> optValue = std::nullopt;
// ... инициализируем optValue ...
// забираем либо значение, либо -1
const int valueOrFallback = optValue.value_or(-1);
```

- optional имеет метод value, который, в отличие от `operator*`, бросает исключение std::bad_optional_access при отсутствии значения

- optional имеет операторы сравнения "==", "!=", "<", "<=", ">", ">=", при этом "std::nullopt" меньше любого допустимого значения

- optional имеет оператор явного преобразования в bool, то есть:

```cpp
std::optional<int> optValue = std::none;
// ... инициализируем optValue ...
// проверять в if можно
if (optValue)
{
    ...;
}
// а неявно заносить в переменную или передавать параметром нельзя
bool isInitialized = optValue;
// но можно сделать явного
bool isInitialized = bool(optValue);
```

- optional можно использовать для композиции объекта, время жизни которого короче времени жизни владельца:

```cpp
void Class::InitChild()
{
    // Если m_child - это std::optional<T>, то arg1, arg2 передаются в конструктор типа T
    m_child.emplace(arg1, arg2);
}

void Class::DestroyChild()
{
    m_child = std::none;
}
```

### Тип данных variant

Известный тип данных variant из Boost мигрировал в стандарт под именем `std::variant`, и в процессе миграции интерфейс класса значительно изменился благодаря другим нововведениям C++17.

Шаблонный variant параметризуется несколькими типами значений. Он способен хранить внутри значение любого из перечисленных в параметрах типов. Размер variant в байтах равен размеру наибольшего типа плюс 4 байта на хранение номера текущего типа:

![Иллюстрация](img/variant_size.png)

- variant корректно вызывает конструкторы и деструкторы для внутреннего значения
- variant сам по себе не выделяет память в куче, но хранимый тип, такой как std::string, может сам выделять память
    - оговорка: рекурсивно определённый variant может выделять память в куче

В variant предусмотрена обработка исключений. При присваивании variant нового значения может быть выброшено исключение:

```cpp
// класс AlwaysThrowsOnMove бросает исключение при перемещении
std::variant<int, AlwaysThrowsOnMove> value;
// может быть выброшено исключение, когда старое значение уже удалено,
//  а новое перемещается во внутренний буфер памяти variant
value = AlwaysThrowsOnMove();
```

В случае выброса исключение variant потеряет внутреннее значение и перейдёт в специальное состояние valueless_by_exception, для запроса этого состояния существует одноимённый метод:

```cpp
std::variant<int, AlwaysThrowsOnMove> value;
try
{
    value = AlwaysThrowsOnMove();
}
catch (...)
{
    assert(value.valueless_by_exception());
}
```

Совет: используйте variant для хранения одного из нескольких состояний, если разные состояния могут иметь разные данные

```cpp
struct AnonymousUserState
{
};

struct TrialUserState
{
    std::string userId;
    std::string username;
};

struct SubscribedUserState
{
    std::string userId;
    std::string username;
    Timestamp expirationDate;
    LicenseType licenceType;
};

using UserState = std::variant<
    AnonymousUserState,
    TrialUserState,
    SubscribedUserState
>;
```

Методы работы с variant:

- функция `std::get<KnownType>(...)` бросает исключение, если тип внутри variant не совпадает с ожидаемым, а иначе возвращает ссылку на запрошенный тип
- функция `std::get_if<KnownType>(...)`, которая возвращает указатель на запрошенный тип, если тип внутри variant совпадает с ожидаемым, и возвращает nullptr в противном случае
- функция [visit](http://en.cppreference.com/w/cpp/utility/variant/visit), которая позволяет обойти variant либо с помощью полиморфной лямбды, либо с помощью класса с перегруженным для каждого варианта оператором "()"

Вызов visit принимает callable-объект, выполняет switch-case по внутреннему индексу типа и вызывает callable в той ветке, куда программа перейдёт во время выполнения после switch. Другими словами, во время компиляции вызовы callable будут компилироваться для каждого из вариантов типов. Так может быть использован visit:

```cpp
using variant_t = std::variant<int, double, std::string>;
variant_t value = "Hello, world!";

std::visit([](auto&& arg) {
    // Извлекаем тип аргумента текущего применения полиморфной лямбды
    using T = std::decay_t<decltype(arg)>;
    // Выполняем constexpr if (ещё одна особенность C++17)
    if constexpr (std::is_same_v<T, int>)
        // Эта ветвь компилируется, если T имеет тип int
        std::cout << "int with value " << arg << '\n';
    else if constexpr (std::is_same_v<T, double>)
        // Эта ветвь компилируется, если T имеет тип double
        std::cout << "double with value " << arg << '\n';
    else if constexpr (std::is_same_v<T, std::string>)
        // Эта ветвь компилируется, если T имеет тип std::string
        std::cout << "std::string with value " << std::quoted(arg) << '\n';
    else 
        // Эта ветвь выдаст ошибку компиляции, если не все типы
        //  были обработаны в остальных ветвях.
        static_assert(always_false<T>::value, "non-exhaustive visitor!");
}, value);
```

### Тип данных any

Тип данных "std::any" способен хранить одно значение любого типа, при этом он полностью стирает информацию о типе для постороннего наблюдателя. Может подойти для передачи и сохранения произвольного сообщения с данными при условии, что получатель умеет правильно извлекать значение. Ключевые средства:

- функция std::make_any
- функция any_cast&lt;T&gt; предоставляет доступ к хранимому значению; в случае несоответствия типа ожидаемому одни перегрузки any_cast бросают исключение "std::bad_any_cast", а другие возвращают нулевой указатель
- методы has_value, emplace, reset, swap обслуживают жизненный цикл значения внутри any
- метод type позволяет получить "std::type_info" хранимого внутри типа

## Изменения в стандартных контейнерах

### Поддержка неполных типов данных в vector, list, forward_list

В качестве эксперимента в классах `std::vector`, `std::list` и `std::forward_list` введена поддержка неполных типов, гарантирующая корректную работу подобных рекурсивных структур данных:

```
struct Entry
{
    std::vector<Entry> messages;
};
```

Такие объявления используются, например, в библиотеке json_spirit, реализующей работу с JSON и парсинг на базе Boost.Spirit.

### Метод data() у string

До C++17 получить неконстантную ссылку на внутренние данные строки было трудно:

```cpp
std::string str = GetSomeString();
// Для пустой строки str[0] недопустим, поэтому требуем непустую строку
assert(!str.empty());
char *data = &str[0];
```

В C++11 у типа данных std::vector появился метод data, в C++17 такой же метод появился у строк:

```cpp
std::string str = GetSomeString();
char *data = str.data();
```

### Метод emplace_back возвращает ссылку

Методы emplace_back у различных контейнеров, таких как vector, конструируют новый элемент непосредственно в памяти коллекции, используя все переданные аргументы как параметры конструктора. В C++14 эти методы ничего не возвращали, и часто приходилось явно обращаться к созданному элементу:

```cpp
m_objects.emplace_back();
auto &obj = m_objects.back();
obj.property = value;
// ...
```

В C++17 emplace_back у vector возвращает ссылку на созданный элемент:

```cpp
auto &obj = m_objects.emplace_back();
obj.property = value;
// ...
```

Также напомним, что с C++11 у контейнеров map/vector существует метод emplace, который для map возвращает пару. Второй элемент пары сообщает, состоялась ли вставка нового элемента (true) или элемент по такому ключу уже существовал (false):

```cpp
template< class... Args >
std::pair<iterator,bool> emplace( Args&&... args );
```

### Методы try_emplace и insert_or_assign в контейнерах map и unordered_map

- Метод [try_emplace](http://en.cppreference.com/w/cpp/container/map/try_emplace) выполняет вставку тогда и только тогда, когда заданного ключа ещё нет в контейнере.

```cpp
// Есть перегрузка для key_type const& и key_type&&
template <class... Args>
pair<iterator, bool> try_emplace(const key_type& k, Args&&... args);

// Есть перегрузка для key_type const& и key_type&&
template <class... Args>
iterator try_emplace(const_iterator hint, const key_type& k, Args&&... args);
```

- Метод [insert_or_assign](http://en.cppreference.com/w/cpp/container/map/insert_or_assign) выполняет либо вставку, либо присваивание значения существующего элемента:

```cpp
// Есть перегрузка для key_type const& и key_type&&
template <class M>
pair<iterator, bool> insert_or_assign(const key_type& k, M&& obj);

// Есть перегрузка для key_type const& и key_type&&
template <class M>
iterator insert_or_assign(const_iterator hint, const key_type& k, M&& obj);
```

### Срезы (slices) для контейнеров map, unordered_map, set, unordered_set

В C++17 для данных контейнеров появилась поддержка срезов, обеспеченная новым методом [extract](http://en.cppreference.com/w/cpp/container/map/extract) и расширением метода [insert](http://en.cppreference.com/w/cpp/container/map/insert).

- Метод extract извлекает внутренний узел контейнера (отделяет его от контейнера и возвращает)
- Метод insert теперь умеет вставлять ранее извлечённые узлы

```cpp
map<int, string> mapping = { {1, "mango"}, {2, "papaya"}, {3, "guava"} };
auto nodeHandle = mapping.extract(2);
nodeHandle.key() = 4;
mapping.insert(std::move(nodeHandle));
// mapping == { {1,”mango”}, {3,”guava”}, {4,”papaya”} }
```

### Метод merge для контейнеров map, unordered_map, set, unordered_set

В C++17 для данных контейнеров появился метод [merge](http://en.cppreference.com/w/cpp/container/map/merge), который пытается один за другим извлечь все узлы из переданного контейнера методом extract и переместить их в другой контейнер методом insert. Такие перегрузки есть у метода в контейнере map:

```cpp
// Есть перегрузка для Allocator& и Allocator&&
template<class C2>
void merge(std::map<Key, T, C2, Allocator>& source);

template<class C2>
void merge(std::multimap<Key, T, C2, Allocator>& source);
```

### Метод weak_from_this при наследовании от enable_shared_from_this

### Улучшения для tuple

В C++17 исправлена проблема tuple: теперь можно использовать список инициализации для его конструирования

```cpp
std::tuple<int, int> foo_tuple() 
{
    // Ошибка в версиях до C++17
    return {1, -1};
}
```

Также появилась функция [apply](http://en.cppreference.com/w/cpp/utility/apply), которая принимает функтор и кортеж, и вызывает функтор с кортежем в качестве списка аргументов.

## Новые алгоритмы и утилиты

### Наибольший общий делитель, наименьшее общее частное

- функция [gcd](http://en.cppreference.com/w/cpp/numeric/gcd) вычисляет наибольший общий делитель (greatest common divisor) двух значений
- функция [lcm](http://en.cppreference.com/w/cpp/numeric/lcm) вычисляет наименьшее общее частное (least common multiple) двух значений

### Функция clamp

Функция [clamp](http://en.cppreference.com/w/cpp/algorithm/clamp) дополняет функции min и max. Она обрезает значение и сверху, и снизу.

### Функции size, empty и data

Используйте [std::size](http://en.cppreference.com/w/cpp/iterator/size) для измерения длины C-style массива:

```cpp
#include <vector>
#include <iterator> //< для std::size

int main() 
{
    {
        std::vector<int> values = { 3, 14, 41 };
        size_t valuesSize = std::size(values);
        assert(valuesSize == 3);
    }

    {
        int values[] = { -5, 5, 15 };
        size_t valuesSize = std::size(values);
        assert(valuesSize == 3);
    }

    {
        // ! ошибка компиляции на вызове std::size !
        int *values = new int[3];
        size_t valuesSize = std::size(values);
        assert(valuesSize == 3);
    }
}
```

Свободные функции [std::empty](http://en.cppreference.com/w/cpp/iterator/empty) и [std::data](http://en.cppreference.com/w/cpp/iterator/data) дополняют функции std::size, std::begin, std::end, позволяя прозрачно работать как с контейнерами STL, так и с C-style массивами либо списками инициализации std::initializer_list

### Функция sample

Функция [sample](http://en.cppreference.com/w/cpp/algorithm/sample) выбирает n элементов из последовательности [first, last) таких, что каждый выбранный образец имеет одинаковую вероятности появления. Для генерации случайных чисел используется переданный генератор.

### Функция for_each_n

Функция [for_each_n](http://en.cppreference.com/w/cpp/algorithm/for_each_n) применяет функтор для N первых элементов последовательности.

### Новые перегрузки алгоритма search и объекты searcher

В предыдущих стандартах C++ алгоритмы [search](http://en.cppreference.com/w/cpp/algorithm/search) и [search_n](http://en.cppreference.com/w/cpp/algorithm/search_n) выполнял поиск "в лоб", без оптимизаций по алгоритмам Бойера-Мура или Бойера-Мура-Хорспула. В новом стандарте появились объекты [default_searcher](http://en.cppreference.com/w/cpp/utility/functional/default_searcher), [boyer_moore_searcher](http://en.cppreference.com/w/cpp/utility/functional/boyer_moore_searcher), [boyer_moore_horspool_searcher](http://en.cppreference.com/w/cpp/utility/functional/boyer_moore_horspool_searcher), а также перегрузки search и search_n, работающие с этими объектами.

### to_chars и from_chars

> Пример взят из доклада [Антон Полухин. C++17 (C++ SIBERIA 2016)](http://cpp-russia.ru/?page_id=1253)

В C++17 появились две функции для безопасного и предсказуемого преобразования из диапазона `char*` в числа и обратно, прекрасно дополняющие функции to_string (to_wstring). Однако, функции [to_chars](http://en.cppreference.com/w/cpp/utility/to_chars) и [from_chars](http://en.cppreference.com/w/cpp/utility/from_chars) лучше использовать в библиотеках и утилитах, и не вызывать напрямую в повседневном коде.

Старый подход для конвертации строки в число подразумевал применение strtoi (strtod, strtoll) либо ostringstream:

```cpp
// ! устаревший код !
#include <sstream>

// ! устаревший код !
// конвертирует строку в число, в случае ошибки возвращает 0
template<class T>
T atoi_14(const std::string &str)
{
    T res{};
    std::ostringstream oss(str);
    oss >> res;
    return res;
}
```

Новый подход позволяет избежать как C-style кода, так и громоздкого stringstream, который к тому же конструирует объект locale. Теперь конвертация строки в число может выглядеть так:

```cpp
#include <utility>

// конвертирует строку в число, в случае ошибки возвращает 0
template<class T>
T atoi_17(std::string_view str)
{
    T res{};
    std::from_chars(str.data(), str.data() + str.size(), res);
    return res;
}
```

Функции to_chars и from_chars поддерживают обработку ошибок: они возвращают по два значения:

- первое имеет тип `char*` или `const char*` соответственно и указывает на место останова конвертации
- второе имеет тип `std::error_code` и сообщает подробную информацию об ошибке, пригодную для выброса исключения `std::system_error`

Поскольку в прикладном коде способ реакции на ошибку может различаться, следует помещать вызовы to_chars и from_chars внутрь библиотек и утилитных классов.

### Специальные математические функции

В C++17 введено множество специальных математических функций, таких как beta-функция, полиномы Лежандра и Лагранжа и так далее. Подробнее рассказано в [документации на cppreference](http://en.cppreference.com/w/cpp/numeric/special_math).

### Новые алгоритмы inclusive и exclusive scan

Без подробностей, потому что алгоритмы узкоспециальные:

- алгоритм [exclusive_scan](http://en.cppreference.com/w/cpp/algorithm/exclusive_scan) подобен [partial_sum](http://en.cppreference.com/w/cpp/algorithm/partial_sum), но не включает i-й элемент в i-ю сумму
- алгоритм [transform_exclusive_scan](http://en.cppreference.com/w/cpp/algorithm/transform_exclusive_scan), но включает i-й элемент в i-ю сумму
- алгоритм [inclusive_scan](http://en.cppreference.com/w/cpp/algorithm/inclusive_scan) применяет функтор к каждому элементу, затем вычисляет одно значение с помощью exclusive_scan
- алгоритм [transform_inclusive_scan](http://en.cppreference.com/w/cpp/algorithm/transform_inclusive_scan) применяет функтор к каждому элементу, затем вычисляет одно значение с помощью inclusive_scan

### Новые алгоритмы destroy* и uninitialized*

- алгоритм [destroy](http://en.cppreference.com/w/cpp/algorithm/destroy) разрушает объекты в диапазоне [first, last), применяя к каждому из них `std::destroy_at(std::addressof(*iterator))`

```cpp
// Имеет параллельную версию.
template<class ForwardIterator>
void destroy(ForwardIterator first, ForwardIterator last);
```

- алгоритм [destroy_at](http://en.cppreference.com/w/cpp/algorithm/destroy_at) вызывает деструктор для объекта, на который указывает итератор

```cpp
template<class T>
void destroy_at(T *ptr)
{
    ptr->~T();
}
```

- алгоритм [destroy_n](http://en.cppreference.com/w/cpp/algorithm/destroy_n) разрушает N объектов, начиная с итератора first

```cpp
// Имеет параллельную версию.
template<class ForwardIterator, class Size>
void destroy_n(ForwardIterator first, Size n);
```

Алгоритмы семейства "uninitialized_*" дополняют алгоритмы destroy, позволяя заполнять, перемещать, конструировать элементы на неинициализированных участках памяти.

## Параллельные алгоритмы

### Стратегии выполнения (execution policies)

В C++17 для алгоритмов над коллекциями из заголовка `<algorithm>` появились параллельные версии, которые по сути являются перегрузками существующих функций. Перегрузки получают дополнительный первый параметр, который принимает одно из трёх значений:

- "std::execution::seq" для обычного последовательного выполнения
- "std::execution::par" для обычного параллельного выполнения, в таком режиме программист обязан заботиться об отсутствии состояния гонки при доступе к данным, но может использовать выделение памяти, блокировки мьютексов и так далее
- "std::execution::par_unseq" для неупорядоченного параллельного выполнения, в таком режиме переданные программистом функторы не должны выделять память, блокировать мьютексы или другие ресурсы

Некоторые особенности низлежащих механизмов:

- потоки для параллельного исполнения создаются на усмотрение стандартной библиотеки
- переданные программистом функторы не должны выбрасывать исключения, иначе будет вызван "std::terminate"

### Алгоритм reduce

Алгоритм [reduce](http://en.cppreference.com/w/cpp/algorithm/reduce) эквивалентен алгоритму [accumulate](http://en.cppreference.com/w/cpp/algorithm/accumulate) во всём, кроме одного: свёртка результатов может быть неупорядоченной. Вместе с параллельными стратегиями выполнения и алгоритмом transform, reduce позволяет реализовать подход Map-Reduce, популярный в различных языках и библиотеках.

### Алгоритм transform_reduce

Алгоритм [transform_reduce](http://en.cppreference.com/w/cpp/algorithm/transform_reduce) реализует подход Map-Reduce, выполняя преобразование элементов (возможно, с помощью переданного программистом функтора) и затем неупорядоченную свёртку элементов (возможно, с помощью второго функтора)

## Инструкции и поток управления

### switch-case и fallthrough

В C++17 появился атрибут fallthrough, способный помочь с вечными проблемами case/break:

- обычно в конце case происходит break, return или throw, что завершает выполнение блока кода
- если в конце case ничего нет, в C++17 надо поставить `[[fallthrough]]` — атрибут для следующего case
- если компилятор не увидит `[[fallthrough]]`, в C++17 он должен выдать предупреждение о неожиданном переходе к следующей метке case

```cpp
void example(int action)
{
    void handler1(), handler2(), handler3();
    switch (action)
    {
    case 1:
    case 2:
        handler1();
        [[fallthrough]] // атрибут привязан к следующему case
    case 3:
        handler2();
        // предупреждение: переход к следующей метке без fallthrough
    case 4:
        handler3();
        [[fallthrough]] // некорректный код: атрибут ни к чему не привязан
    }
}
```

### Гарантированное устранение копирования (guaranteed copy elision)

>Есть подробная статья о Return Value Optimization и Copy Elision на английском: [Guaranteed Copy Elision](https://jonasdevlieghere.com/guaranteed-copy-elision)

В C++17 вы можете полагаться на устранение копирований и перемещений и смело писать код как в примере ниже, не оглядываясь на конструкторы копирования и перемещения:

```cpp
auto object = Class(a, b, c, ...);
```

### Декомпозиция в объявлениях переменных

В C++17 появилась декомпозиция пользовательских структур, std::tuple, std::pair и std::array в объявлении переменных:

```cpp
pair<iterator, bool> try_emplace(map<string, string> &mapping, string_view value)
{
    // ...
}

// ! устаревший код !
iterator it;
bool succeed = false;
std::tie(it, succeed) = try_emplace(mapping, "hello!");

// C++17
auto [it, succeed] = try_emplace(mapping, "hello!");
```

### if и switch с инициализатором

В C++17 условие if и switch может состоять из двух секций:

- `if (init; condition)`
- `switch (init; condition)`

Это может упростить работу с итераторами или некоторыми указателями:

```cpp
// C++17: if с инициализатором, в котором объявляется переменная,
//        видимая для обеих веток if и else.
if (auto p = m.try_emplace(key, value); !p.second)
{
    throw std::runtime_error("Element already registered");
}
else
{
    process(p.second);
}
```

Отметим, что в C++ и раньше можно было в некоторых случаях выполнять присваивание с проверкой:

```cpp
// CreateResource может возвращать обычный или умный указатель либо optional
if (auto p = CreateResource())
{
    ProcessResource(p);
}
else
{
    ThrowWin32LastError();
}
```

### Вывод типов при конструировании шаблонных классов

Вызовы функций make_pair, make_tuple и т.п. можно заменить на прямое конструирование:

```cpp
void fn(std::pair<int, char>);

// ! устаревший код !
fn(std::make_pair(42, 'a'));

// новый подход C++17
fn(std::pair(42, 'a'));
```

Эта фишка упрощает работу с std::array:

```cpp
// ! устаревший код !
std::array<char, 43> data = "The quick brown fox jumps over the lazy dog";

// новый подход C++17
std::array<char> data = "The quick brown fox jumps over the lazy dog";
```

### Новые гарантии порядка вычислений

> Подробнее см. [What are the evaluation order guarantees introduced by C++17](http://stackoverflow.com/questions/38501587/)

- постфиксные выражения, в том числе вызовы и обращения к элементу, вычисляются слева направо
    - в случае вызова сначала вычисляется вызываемый функтор или адрес функции, а затем в неопределённом по стандарту порядке вычисляются аргументы
- присваивания вычисляются справа налево, включая составные присваивания
- операнды в операторах смещения `<<` и `>>` вычисляются слева направо

Данные гарантии нужны для будущих версий стандартной библиотеки.

### Атрибут nodiscard

Используйте атрибут [[nodiscard]] для пометки функции, если отсутствие обработки возвращаемого функцией значения скорее всего является ошибкой. Примером служат функции-конструкторы, которые возвращают unique_ptr или shared_ptr без побочных эффектов.

### constexpr if

В C++17 появились constexpr if, которые широко применимы в метапрограммировании, но также полезны и в повседневном коде внутри полиморфных лямбда-функций:

```cpp
// Представьте, что это шаблонная функция из библиотеки
//  функция std::visit работает похожим образом
template <class Functor>
void callTwice(Functor && fn)
{
    fn(42);
    fn("hello!"s);
}

void userFunction()
{
    callTwice([](auto && value) {
        if constexpr (std::is_integral_v<decltype(value)>)
        {
            // Компилируется, если тип value является целочисленным
            std::cout << "Integral value: " << value << std::endl;
        }
        else
        {
            // Компилируется в противном случае
            std::cout << "Non-integral value: " << value << std::endl;
        }
    });
}
```

### Объявление вложенных пространств имён

В C++17 можно описать вложенные пространства имён в одной строке:

```cpp
namespace product::account::details
{
}
```

А ранее приходилось писать на разных строках:

```cpp
// ! устаревший код !
namespace product
{
namespace account
{
}
namespace details
{
}
}
```

## Уточнённые спецификации

### Неправильное использование enable_shared_from_this

В предыдущей версии стандарта если вы использовали `std::enable_shared_from_this` в конструкторе, деструкторе либо в объекте, который не был создан с помощью make_shared, то вы получали неопределённое поведение.

В некоторых реализациях вы могли получит исключение `std::bad_weak_ptr`. Начиная с C++17 неопределённого поведения больше нет, и во всех реализациях вы будете получать исключение `std::bad_weak_ptr`.

## Удалённые возможности

### Удаление триграфов

В старые времена для работы на необычных системах, где не было некоторых символов ASCII, были введены триграфы. Например:

- цепочку `??=` компилятор воспринимал как `#`
- цепочку `??-` компилятор воспринимал как `~`

Все триграфы начинались с символа `??`. Начиная с C++17 триграфов больше не существует.

Однако, диграфы пока ещё сохранились:

- `<:` компилятор воспринимает как `[`
- `:>` компилятор воспринимает как `]`
- `<%` компилятор воспринимает как `{`
- `%>` компилятор воспринимает как `}`
- `%:` компилятор воспринимает как `#`

### Удаление ключевого слова register

Ключевое слово больше не используется как спецификатор переменной. Оно зарезервировано для применения в будущем в других целях.

### Удаление оператора инкремента для bool

Данный код не скомпилируется в C++17:

```cpp
bool isYellow = false;
++isYellow;
```

### Запрет спецификации типов исключений

Больше нельзя указывать, какие именно исключения выбрасывает функция. Можно использовать только `throw()`, но лучше писать `noexcept`. Пример кода, который больше не скомпилируется, приведён ниже:

```cpp
void foo(int a) throw(std::runtime_error)
{ 
    if (a == 0)
    {
        throw std::runtime_error("argument is zero");
    }  
}  
```

### Удаление auto_ptr

Класс удалён в пользу `std::unique_ptr`. Проблемой auto_ptr был странный "конструктор копирования", который принимал другой объект по изменяемой ссылке и вместо копирования принимал изъятие внутренних данных.

Если вы используете компилятор MSVC с флагом `/std:c++latest`, то при использовании auto_ptr вы получите ошибку:

```cpp
error C2039: 'auto_ptr': is not a member of 'std'
```

### Удаление старых функциональных утилит

Из пространства имён std удалены следующие функции, ранее признанные устаревшими:

- `unary_function`
- `binary_function`
- `ptr_fun`
- `mem_fun`
- `mem_fun_ref`
- `bind1st`
- `bind2nd`
- `random_shuffle`

## Устаревшие возможности

### codecvt устарел

Объявлен устаревшим заголовок <codecvt>, предоставляющий единственный надёжный и стандартный способ конвертации `wstring` и `wchar_t` в UTF8 строки и обратно. Он будет убран из стандарта в тот момент, когда будет стандартизирована какая-либо подходящая альтернатива.

Причиной отказа от `<codecvt>` стали некоторые проблемы с поддержкой UTF8: для спецификации способа конвертации использовалась ссылка на старый, неактуальный стандарт. Кроме того, некоторые невалидные последовательности байт вместо корректного UTF8 могли быть использованы в качестве метода атаки для наивно написанного кода.

### result_of устарел

Вспомогательный шаблон `std::result_of<Expr>` объявлен устаревшим и будет заменён на новый тип, который скорее всего будет назван `std::invoke_result`.

### Метод unique класса shared_ptr устарел

Метод признан небезопасным в многопоточной среде, рекомендуется его не использовать. Если у вас есть `shared_ptr`, трудно гарантировать захват находящегося внутри объекта в уникальное владение, т.к. одновременно другой поток может увеличить счётчик ссылок.
