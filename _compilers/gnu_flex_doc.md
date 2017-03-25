---
title: Изучаем генератор кода GNU Flex
preview: img/gnu-logo-2.png
subtitle: GNU Flex позволяет описать лексический анализатор на простом языке Flex, перечислив регулярные выражения для отдельных токенов и указав код, исполняемый при сопоставлении каждого токена. Затем Flex генерирует код на языке C или C++. Полученный код использует детерминированный конечный автомат.
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

```bash
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

Напишем на C++ простой интерпретатор, принимающий 6 команд:

```
help - выводит справку обо всех командах
up - направляет робота вверх
left - направляет робота влево
down - направляет робота вниз
right - направляет робота вправо
exit - выходит из программы
```

Команды читаются из стандартного потока ввода `std::cin` последовательно как слова, вывод и ошибки печатаются в потоки `std::cin` и `std::cout` соответственно. Так может выглядеть реализация, использующая потоки для чтения отдельных слов:

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
