---
title: Руководство по lexertl
preview: img/sql_server_string.png
subtitle: C++ библиотека lexertl во многом лучше GNU Flex. Она умеет создавать лексические анализаторы из правил в runtime, может обрабатывать unicode, и даже умеет генерировать код сканера на C++. Библиотека header-only и очень проста в установке.
github: https://github.com/BenHanson/lexertl
---

Библиотека lexertl служит для разбора регулярных грамматик. Иными словами, с её помощью можно написать лексический анализатор (англ. lexer или scanner), который обработает входной текст и превратить его в поток токенов, который гораздо легче использовать в полноценном парсере.

## Установка lexertl

lexertl является header-only библиотекой для C++, и для установки достаточно

- выкачать исходный код из [репозитория на github](https://github.com/BenHanson/lexertl)
- добавить путь к каталогу с исходным кодом в пути поиска заголовков

После этих шагов создайте новый файл или проект на C++, добавьте туда простой пример кода и соберите:

```cpp
#include "lexertl/generator.hpp"
#include "lexertl/lookup.hpp"
#include <iostream>

int main()
{
    lexertl::rules rules;
    lexertl::state_machine sm;

    rules.push("[0-9]+", 1);
    rules.push("[a-z]+", 2);
    lexertl::generator::build(rules, sm);

    std::string input("abc012Ad3e4");
    lexertl::smatch results(input.begin(), input.end());

    // Read ahead
    lexertl::lookup(sm, results);

    while (results.id != 0)
    {
        std::cout << "Id: " << results.id << ", Token: '" <<
            results.str () << "'\n";
        lexertl::lookup(sm, results);
    }

    return 0;
}
```

## Пишем сканер выражений калькулятора с lexertl

> У библиотеки есть Web-страница с документацией: [www.benhanson.net/lexertl.html](http://www.benhanson.net/lexertl.html)

Представленная ниже программа выводит номера и строки токенов для входного выражения с идентификаторами и числами. Ввод читается построчно из stdin, для выхода из программы достаточно ввести символ конца файла.

```
>velocity + 27 * accel / 19
Id: 2, Token: 'velocity'
Id: 3, Token: '+'
Id: 1, Token: '27'
Id: 5, Token: '*'
Id: 2, Token: 'accel'
Id: 6, Token: '/'
Id: 1, Token: '19'
```

Библиотека состоит лишь из заголовочных файлов и не требует компоновки. Конечный автомат для лексического анализа может быть собран в runtime. Поэтому реализация состоит всего лишь из одного файла:

```cpp
#include "lexertl/generator.hpp"
#include "lexertl/iterator.hpp"
#include <boost/range/iterator_range.hpp>
#include <iostream>
#include <memory>

enum {
    // ID пользовательских токенов должны начинаться с 1,
    //  т.к. число 0 lexertl резервирует для ID "конец ввода".
    // Если один из ID равен нулю, программа аварийно завершится.
    TK_NUMBER = 1,
    TK_IDENTIFIER,
    TK_PLUS,
    TK_MINUS,
    TK_MULTIPLY,
    TK_DIVIDE,
};

// Создаёт детерминированный конечный автомат (DFA)
//  для лексического анализа грамматики калькулятора
std::unique_ptr<lexertl::state_machine> BuildCalcLexer()
{
    lexertl::rules rules;

    // Метод push добавляет правило
    rules.push("[0-9]+", TK_NUMBER);
    rules.push("[a-z]+", TK_IDENTIFIER);
    rules.push("\\+", TK_PLUS);
    rules.push("\\-", TK_MINUS);
    rules.push("\\*", TK_MULTIPLY);
    rules.push("\\/", TK_DIVIDE);

    // Метод skip возвращает специальный ID,
    //  который означает, что это совпадение игнорируется.
    // Так мы можем пропустить пробельные символы.
    rules.push("[ \t\r\n]+", rules.skip());

    auto lexer = std::make_unique<lexertl::state_machine>();
    lexertl::generator::build(rules, *lexer);

    return lexer;
}

// Возвращает диапазон для прохода слева направо,
//  который при запросе следующего элемента
//  получает его из строки `line` с помощью лексера `lexer`
decltype(auto) TokenizeLine(const lexertl::state_machine &lexer, std::string &line)
{
    lexertl::siterator begin(line.begin(), line.end(), lexer);
    lexertl::siterator end;

    // Непосредственно при вызове токенизации не происходит,
    //  такой подход называется lazy evaluation with generators.
    return boost::make_iterator_range(begin, end);
}

int main()
{
    auto lexer = BuildCalcLexer();

    while (std::cin)
    {
        std::string line;
        std::getline(std::cin, line);
        for (auto &token : TokenizeLine(*lexer, line))
        {
            std::cout << "Id: " << token.id << ", Token: '" << token.str() << "'\n";
        }
    }

    return 0;
}
```

## Генерация C++ кода

Можно легко модифицировать предыдущий пример, чтобы сгенерировать исходный код функции, реализующей лексический анализ той же самой регулярной грамматики. Полученный код по-прежнему использует библиотеку lexertl, но уже не требует конструирования лексера во время выполнения.

Первым делом подключите два новых заголовка:

```cpp
#include "lexertl/generator.hpp"
#include "lexertl/generate_cpp.hpp"
```

Затем в функцию BuildCalcLexer после вызова `lexertl::generator::build` добавьте всего две строки кода:

```cpp
// Минимизируем детерминированный конечный автомат,
//  это занимает немного времени, но взамен ускорит работу сканера.
lexer->minimise();

// Генерируем table-driven лексер на C++,
// В качестве имени функции передаём LookupExprToken.
lexertl::table_based_cpp::generate_cpp("LookupExprToken", *lexer, false, std::cout);
```

Запустите изменённый пример, и при старте программа выведет в консоль C++ код функции lookupExprToken, который выглядит примерно так:

```cpp
template<typename iter_type, typename id_type>
void LookupExprToken (lexertl::match_results<iter_type, id_type> &results_)
{
    // ...table-driven реализация разбора следующего токена...
}
```

Сгенерированный код можно поместить в файл "LookupExprToken.hpp", и после этого для реализации лексера достаточно подключить заголовок и написать управляющую функцию. Полученная программа будет вести себя так же, как в предыдущем примере:

```cpp
#include "lexertl/iterator.hpp"
#include "LookupExprToken.hpp"

int main()
{
    while (std::cin)
    {
        std::string line;
        std::getline(std::cin, line);

        // Заполняем буфер состояния.
        lexertl::smatch results(line.begin(), line.end());

        // Cчитываем первый токен
        LookupExprToken(results);
        while (results.id != 0)
        {
            std::cout << "Id: " << results.id << ", Token: '" << results.str() << "'\n";
            LookupExprToken(results);
        }
    }

    return 0;
}
```

## Отладочный вывод структуры ДКА

Можно выполнить отладочную печать состояний и переходов созданного в lexertl ДКА.

Во-первых нужно подключить ещё один заголовок:

```cpp
#include "lexertl/debug.hpp"
```

Затем в функцию BuildCalcLexer после вызова `lexertl::generator::build` добавьте вызов отладочной печати:

```cpp
// Минимизируем детерминированный конечный автомат,
//  это занимает немного времени, но взамен уменьшит объём таблицы.
lexer->minimise();

// Выводим в stdout человекочитаемые таблицы состояний и переходов.
lexertl::debug::dump(*lexer, std::cout);
```
