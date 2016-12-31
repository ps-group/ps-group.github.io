---
layout: page
title: "Компиляторы"
permalink: /compilers/
---

## Проекты

Проекты выполняются в течении всего курса и сдаются в конце. В некоторых проектах возможна командная работа &mdash; об этом написано явно в спецификации.

Спецификации проектов:

- [Компилятор процедурного языка](/compilers/project_compiler.html)
- [Интерпретатор языка PostScript для 2D графики](/compilers/project_postscript.html)

## Обзорные статьи

- [Книги о разработке компиляторов](/compilers/compiler_books.html)
- [А что такое Compiler Driver?](/compilers/what_is_driver.html)
- [А что такое Compiler Frontend?](/compilers/what_is_frontend.html)
- [А что такое Compiler Backend?](/compilers/what_is_backend.html)

## Frontend компилятора, основы

- [Конечные автоматы](/compilers/fsm.html)
- [Грамматики](/compilers/grammars.html)
- [Калькулятор на основе рекурсивного спуска](/compilers/simple_recursive_parser.html)
- [Abstract Syntax Tree](/compilers/ast.html)
- [Восходящий разбор по принципу сдвига и свёртки (shift-recude)](/compilers/shift_reduce.html)
- [Полезные утилиты из STL и Boost для фронтенда](/compilers/frontend_utils.html)

## Backend, основы

- [FFI - механизм интеграции между языками программирования](/compilers/backend_ffi.html)
- [Стековые и регистровые машины](/compilers/stack_and_register.html)
- [Исследуем работу компилятора C/C++](/compilers/c_in_depth.html)
- [Автоматизируем вызов graphviz из командной строки](/compilers/driver_popen.html)

## Frontend, продвинутый уровень

Генерируем LALR-парсер, строим AST, добавляем проходы для обработки семантики. Все примеры в этой серии статей основаны на C++14 и генераторе кода Lemon.

- [Полный пример интерпретатора python-подобного языка](https://github.com/sergey-shambir/pythonish-interpreter/tree/master/src)
- [Серия примеров элементов фронтенда и бекенда компилятора на C++, Lemon и LLVM](https://github.com/ps-group/compiler-theory-samples)

## Backend, продвинутый уровень

Изучаем LLVM, виртуальный ассемблер LLVM-IR, генерируем машинный код. Все примеры в этой серии статей основаны на C++14, генераторе кода Lemon или библиотеках проекта LLVM.

- [Серия примеров элементов фронтенда и бекенда компилятора на C++, Lemon и LLVM](https://github.com/ps-group/compiler-theory-samples)
