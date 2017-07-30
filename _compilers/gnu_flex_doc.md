---
title: Изучаем генератор кода GNU Flex
preview: img/gnu-logo-2.png
subtitle: GNU Flex позволяет описать лексический анализатор на простом языке Flex, перечислив регулярные выражения для отдельных токенов и указав код, исполняемый при сопоставлении каждого токена. Затем Flex генерирует код на языке C или C++. Полученный код использует детерминированный конечный автомат для разбора текста.
github: https://github.com/westes/flex
---

Перед чтением этой статьи рекомендуется ознакомиться со [статьёй об особенностях языка C](c_style_code)

## Опции командной строки

> Философия UNIX гласит: пишите программы, которые делают что-то одно и делают это хорошо.

GNU flex является утилитой командной строки, построенной по принципам UNIX-систем. Утилита принимает множество опций командной строки, в том числе `--help` и `--version`. Примеры вывода при запуске с этими опциями:

```
>flex --version
flex 2.6.0
```

```
>flex --help
Использование: flex [ПАРАМЕТРЫ] [ФАЙЛ]…
Generates programs that perform pattern-matching on text.

Table Compression:
  -Ca, --align      trade off larger tables for better memory alignment
  -Ce, --ecs        construct equivalence classes
  -Cf               do not compress tables; use -f representation
  -CF               do not compress tables; use -F representation
  -Cm, --meta-ecs   construct meta-equivalence classes
  -Cr, --read       use read() instead of stdio for scanner input
  -f, --full        generate fast, large scanner. Same as -Cfr
  -F, --fast        use alternate table representation. Same as -CFr
  -Cem              default compression (same as --ecs --meta-ecs)

Debugging:
  -d, --debug             enable debug mode in scanner
  -b, --backup            write backing-up information to lex.backup
  -p, --perf-report       write performance report to stderr
  -s, --nodefault         suppress default rule to ECHO unmatched text
  -T, --trace             flex should run in trace mode
  -w, --nowarn            do not generate warnings
  -v, --verbose           write summary of scanner statistics to stdout
      --hex               use hexadecimal numbers instead of octal in debug outputs

Files:
  -o, --outfile=FILE      specify output filename
  -S, --skel=FILE         specify skeleton file
  -t, --stdout            write scanner on stdout instead of lex.yy.c
      --yyclass=NAME      name of C++ class
      --header-file=FILE   create a C header file in addition to the scanner
      --tables-file[=FILE] write tables to FILE

Scanner behavior:
  -7, --7bit              generate 7-bit scanner
  -8, --8bit              generate 8-bit scanner
  -B, --batch             generate batch scanner (opposite of -I)
  -i, --case-insensitive  ignore case in patterns
  -l, --lex-compat        maximal compatibility with original lex
  -X, --posix-compat      maximal compatibility with POSIX lex
  -I, --interactive       generate interactive scanner (opposite of -B)
      --yylineno          track line count in yylineno

Generated code:
  -+,  --c++               generate C++ scanner class
  -Dmacro[=defn]           #define macro defn  (default defn is '1')
  -L,  --noline            suppress #line directives in scanner
  -P,  --prefix=STRING     use STRING as prefix instead of "yy"
  -R,  --reentrant         generate a reentrant C scanner
       --bison-bridge      scanner for bison pure parser.
       --bison-locations   include yylloc support.
       --stdinit           initialize yyin/yyout to stdin/stdout
       --noansi-definitions old-style function definitions
       --noansi-prototypes  empty parameter list in prototypes
       --nounistd          do not include <unistd.h>
       --noFUNCTION        do not generate a particular FUNCTION

Miscellaneous:
  -c                      do-nothing POSIX option
  -n                      do-nothing POSIX option
  -?
  -h, --help              produce this help message
  -V, --version           report flex version
```

## Задача: интерпретатор для управления роботом

Допустим, нам нужно написать простой интерпретатор, принимающий 6 команд:

```
help - выводит справку обо всех командах
up - направляет робота вверх
left - направляет робота влево
down - направляет робота вниз
right - направляет робота вправо
exit - выходит из программы
```

Команды читаются из стандартного потока ввода `std::cin` последовательно как слова, вывод и ошибки печатаются в потоки `std::cin` и `std::cout` соответственно.

### Реализация на C++ с помощью iostream

Ниже представлена реализация, использующая потоки для чтения отдельных слов. Далее мы попробуем дополнить эту реализацию сканером на GNU Flex, а пока что изучите исходный код примера:

```cpp
#include <string>
#include <map>
#include <memory>
#include <iostream>

namespace
{
struct Interpreter
{
    std::map<std::string, std::function<void()>> commands;
    bool willExit = false;
};

decltype(auto) MakeRobotInterpreter()
{
    auto interpreter = std::make_shared<Interpreter>();
    interpreter->commands["up"] = [] {
        std::cout << "Walking up..." << std::endl;
    };
    interpreter->commands["down"] = [] {
        std::cout << "Walking down..." << std::endl;
    };
    interpreter->commands["left"] = [] {
        std::cout << "Walking left..." << std::endl;
    };
    interpreter->commands["right"] = [] {
        std::cout << "Walking right..." << std::endl;
    };
    interpreter->commands["help"] = [interpreter] {
        std::cout << "Available commands:" << std::endl;
        for (const auto &pair : interpreter->commands)
        {
            std::cout << pair.first << std::endl;
        }
    };
    interpreter->commands["exit"] = [interpreter] {
        interpreter->willExit = true;
        std::cout << "Bye bye!" << std::endl;
    };

    return interpreter;
}

void ExecuteCommand(Interpreter &interpreter, const std::string &word)
{
    auto foundIt = interpreter.commands.find(word);
    if (foundIt != interpreter.commands.end())
    {
        foundIt->second();
    }
    else
    {
        std::cerr << "unknown command " << foundIt->first << std::endl;
    }
}

void ReadInputInLoop(Interpreter &interpreter)
{
    std::string word;
    while (!interpreter.willExit && (std::cin >> word))
    {
        ExecuteCommand(interpreter, word);
    }
}
}

int main()
{
    auto interpreter = MakeRobotInterpreter();
    ExecuteCommand(*interpreter, "help");
    ReadInputInLoop(*interpreter);
}
```

### Описание лексера на Flex

Flex получает описание лексического анализатора из входного файла на специальном языке. Этот файл состоит из трёх секций:

- секция опций позволяет настраивать генерацию лексера
- секция `%{ ... }%` содержит код на C, который будет размещён выше остального сгенерированного кода
- секция `%% ... %%` содержит список правил и обработчиков правил

Обработчик правила — это вставка кода на языке C, которая будет помещена внутрь switch-case. Этот switch-case будет находиться в теле созданной генератором функции, выполняющей сканирование следующего токена. Внутри такой вставки можно выполнить return, чтобы функция вернула сопоставленную подстроку как токен, а можно ничего не делать, чтобы функция пропустила эту подстроку и продолжила выполнение.

GNU Flex предполагает, что набор типов токенов уже известен и предоставлен снаружи; дело в том, что этот набор обычно генерирует парсер контекстно-свободной грамматики, и он же проставляет числовое значение для каждого типа токена; генератору GNU Flex числовые значения типов токена безразличны. Ниже показан пример заголовка, определяющего типы токенов:

```c
#pragma once

enum Token
{
    // Token 0 reserved for the end of input.
    TOKEN_HELP = 1,
    TOKEN_UP,
    TOKEN_LEFT,
    TOKEN_DOWN,
    TOKEN_RIGHT,
    TOKEN_EXIT,
};
```

Далее покажем описание сканера для языка управления роботом:

>Flex использует функцию `yywrap()` для поддержки языков с препроцессором и директивой `#include`, таких как язык C. В нашем языке нет препроцессора, опция отключена.

```c
%option noyywrap

%{
#include <stdio.h>
#include "RobotTokens.h"

// Flex использует макрос YY_DECL как основу объявления функции, сканирующей следующий токен.
// По умолчанию значение макроса YY_DECL равно `int yylex()`
// Но мы назовём функцию ScanToken.
#define YY_DECL int ScanToken()

%}

%%

[ \t\r\n]+ { /* игнорируем пробелы, табы и переносы строк */ }

"help"  { return TOKEN_HELP; }
"up"    { return TOKEN_UP; }
"left"  { return TOKEN_LEFT; }
"down"  { return TOKEN_DOWN; }
"right" { return TOKEN_RIGHT; }
"exit"  { return TOKEN_EXIT; }

%%
```

### Генерация кода сканера с помощью GNU Flex

Для сборки потребуется запустить flex из командной строки с подходящими опциями (список возможных опций был показан ранее). Лучше всего написать скрипт, который автоматизирует запуск генератора кода и позволит не писать одни и те же команды повторно. Скрипт написан на языке Python:

```
#!/usr/bin/env python

import subprocess

# flex получает на вход RobotScanner.l и генерирует RobotScanner.c.
subprocess.check_call(['flex', '-o', 'RobotScanner.c', 'RobotScanner.l'])
```

Если скрип завершился успешно, откройте "RobotScanner.c" и исследуйте созданный код:

- поищите, куда попала строка `#define YY_DECL int ScanToken()` и где используется макрос `YY_DECL`
- посмотрите, где оказалась конструкция `return TOKEN_EXIT;`

Код в "RobotScanner.c" довольно запутанный, и на деле его можно было написать проще на современном языке C, но GNU Flex расчитан на работу в любых условиях, включая очень необычные компиляторы и операционные системы.

### Подключение сканера в main

GNU Flex сгенерировал только файл .c без заголовка, но это не мешает использовать объявленную в нём функцию ScanToken. Мы сделаем следующее:

- опишем функцию ScanToken без тела, т.е. объявим её без определения
- изменим тип поля commands в структуре Interpreter: теперь словарь команд хранит ещё и описания команд, а в роли ключа использует `enum Token`.

```cpp
#include "RobotTokens.h"
#include <string>
#include <map>
#include <memory>
#include <iostream>
#include <functional>

// Объявим функции, которые линковщик найдёт в объектном файле, полученном при компиляции RobotScanner.c
extern "C" {
// Возвращает ID сопоставленного токена или 0, если достигнут конец ввода.
int ScanToken();
}

namespace
{
struct Command
{
    std::string info;
    std::function<void()> action;
};

struct Interpreter
{
    std::map<Token, Command> commands;
    bool willExit = false;
};

decltype(auto) MakeRobotInterpreter()
{
    auto interpreter = std::make_shared<Interpreter>();
    interpreter->commands[TOKEN_UP] = {
        "up - moves robot up",
        [] {
            std::cout << "Walking up..." << std::endl;
        }};
    interpreter->commands[TOKEN_DOWN] = {
        "down - moves robot down",
        [] {
            std::cout << "Walking down..." << std::endl;
        }};
    interpreter->commands[TOKEN_LEFT] = {
        "left - moves robot left",
        [] {
            std::cout << "Walking left..." << std::endl;
        }};
    interpreter->commands[TOKEN_RIGHT] = {
        "right - moves robot right",
        [] {
            std::cout << "Walking right..." << std::endl;
        }};
    interpreter->commands[TOKEN_HELP] = {
        "help - outputs this help",
        [interpreter] {
            std::cout << "Available commands:" << std::endl;
            for (const auto &pair : interpreter->commands)
            {
                std::cout << pair.second.info << std::endl;
            }
        }};
    interpreter->commands[TOKEN_EXIT] = {
        "exit - exits program",
        [interpreter] {
            interpreter->willExit = true;
            std::cout << "Bye bye!" << std::endl;
        }};

    return interpreter;
}

void ExecuteCommand(Interpreter &interpreter, Token tokenId)
{
    auto foundIt = interpreter.commands.find(tokenId);
    if (foundIt != interpreter.commands.end())
    {
        foundIt->second.action();
    }
    else
    {
        std::cerr << "unknown command, type 'help' to see available commands " << std::endl;
    }
}

void ReadInputInLoop(Interpreter &interpreter)
{
    while (!interpreter.willExit)
    {
        int tokenId = ScanToken();
        if (tokenId == 0)
        {
            return; // конец ввода
        }
        ExecuteCommand(interpreter, static_cast<Token>(tokenId));
    }
}
}

int main()
{
    auto interpreter = MakeRobotInterpreter();
    ExecuteCommand(*interpreter, TOKEN_HELP);
    ReadInputInLoop(*interpreter);
}
```

## Добавляем обработку ошибок

Полученная выше программа не умеет обрабатывать ошибки: любой неожиданный ввод просто отражается обратно в консоль. Это неподобающее поведение, и мы реализуем обработку ошибок.

Добавим два новых типа токена в `enum Token`:

```c
// ...
TOKEN_UNEXPECTED_WORD, // неожиданная команда
TOKEN_ERROR, // символ, не входящий в алфавит языка
```

Добавим два новых правила сканера в "RobotScanner.l":

```c
// ...
"exit"  { return TOKEN_EXIT; }
[a-zA-Z]+ { return TOKEN_UNEXPECTED_WORD; }
.       { return TOKEN_ERROR; }
```

Модифицируем функцию ReadInputInLoop, чтобы обрабатывать TOKEN_ERROR. Обрабатывать TOKEN_UNEXPECTED_WORD в этой функции не надо, т.к. функция ExecuteCommand уже обрабатывает неопознанные команды.

```cpp
void ReadInputInLoop(Interpreter &interpreter)
{
    while (!interpreter.willExit)
    {
        int tokenId = ScanToken();
        if (tokenId == 0)
        {
            return; // конец ввода
        }
        if (tokenId == TOKEN_ERROR)
        {
            std::cerr << "wrong character in input" << std::endl;
        }
        else
        {
            ExecuteCommand(interpreter, static_cast<Token>(tokenId));
        }
    }
}
```

После перекомпиляции и запуска программы введём "no!!!" и получим:

```
>no!!!
unknown command, type 'help' to see available commands 
wrong character in input
wrong character in input
wrong character in input
```

## Что делать дальше?

Поупражняйтесь с Flex: попробуйте описать правила для ключевых слов и операторов языка C, или сделать сканер для кода на Python. Не забывайте, что GNU Flex способен работать только с регулярными грамматиками, в которых нет рекурсивно определённых правил.

Если вы хотите использовать свой объект во вставках кода для правил, просто модифицируйте YY_DECL: `#define YY_DECL int ScanToken(MyClass *myClass)`. Тогда сгенерированной функции будет параметр myClass, который сам Flex использовать не станет.

Для отладки правил сканера советуем использовать отладчики регулярных выражений, которые легко найти в поисковике по запросу "online regex debugger".

Справку можно получить на stackoverflow по тегу flex-lexer: [stackoverflow.com/questions/tagged/flex-lexer](http://stackoverflow.com/questions/tagged/flex-lexer).

Избранные вопросы по интеграции GNU Flex в сборку проекта:

- [How to compile LEX/YACC files on Windows?](http://stackoverflow.com/questions/5456011/)
- [unistd.h related difficulty when compiling bison & flex program under vc++](http://stackoverflow.com/questions/2793413/)
- [CMake and Flex/Bison](http://stackoverflow.com/questions/19398113/)

По интеграции сканера в код проекта:

- [String input to flex lexer](http://stackoverflow.com/questions/780676/)
- [In lex how to make yyin point to a file with the main function in yacc?](http://stackoverflow.com/questions/1796520/)
- [Configuring Bison and Flex without global or static variable](http://stackoverflow.com/questions/22107203/)
- [bison/flex: print erroneous line](http://stackoverflow.com/questions/6467166/)

По составлению правил сканера:

- [Regular expression for a string literal in flex/lex](http://stackoverflow.com/questions/2039795/)
- [Difficulty getting c-style comments in flex/lex](http://stackoverflow.com/questions/2130097/)
- [How to use indentation as block delimiters with bison and flex](http://stackoverflow.com/questions/1413204/)
- [Is it possible to set priorities for rules to avoid the “longest-earliest” matching pattern?](http://stackoverflow.com/questions/8379299/)


