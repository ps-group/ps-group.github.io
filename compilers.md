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

## Frontend компилятора, основы

- [А что такое Compiler Frontend?](/compilers/what_is_frontend.html)
- [Калькулятор на основе рекурсивного спуска](/compilers/simple_recursive_parser.html)

## Backend, основы

- [А что такое Compiler Backend?](/compilers/what_is_backend.html)
- [FFI - механизм интеграции между языками программирования](/compilers/backend_ffi.html)
- [Стековые и регистровые машины](stack_and_register.html)

## Frontend, продвинутый уровень

Генерируем LALR-парсер, строим AST, добавляем проходы для обработки семантики

Все примеры в этой серии статей основаны на C++14 и генераторе кода Lemon. Исходный код доступен под OpenSource лицензией MIT.

- [Полный пример интерпретатора python-подобного языка](https://github.com/sergey-shambir/pythonish-interpreter/tree/master/src)
- [Серия примеров элементов фронтенда и бекенда компилятора на C++, Lemon и LLVM](https://github.com/ps-group/compiler-theory-samples)

## Backend, продвинутый уровень

Изучаем LLVM, виртуальный ассемблер LLVM-IR, генерируем машинный код.
