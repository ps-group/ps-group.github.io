# Настройка окружения на Ubuntu

## Библиотеки

В последних версиях Ubuntu все используемые в примерах библиотеки уже есть в репозиториях. Названия пакетов следующие:

- `libgl1-mesa-dev` для разработки с использованием OpenGL
- `libsdl2-dev` для SDL2, `libsdl2-image-dev` для модуля работы с изображениями в форматах, отличных от BMP
- `libopenal-dev`, `libalut-dev` для работы со звуковыми форматами и 3D-эффектами звука через OpenAL
- `libglm-dev` для GLM (OpenGL Mathematics Library)
- `libglew-dev` для доступа к расширениям OpenGL

## IDE и система сборки

Для Ubuntu есть два комфортных и современных набора инструментов для разработки C++.

- CLion (коммерческая IDE компании JetBrains), система сборки CMake
- QtCreator (OpenSource IDE компании Qt Company), система сборки qmake

В любом случае, интеграция системы сборки с графическими настройками среды менее тесная, чем на Windows с Visual Studio. Программисту приходится учиться аккуратно писать скрипты сборки либо на CMake, либо на qmake.

Справка по CMake:

- [Простые примеры сборки приложения и библиотеки с CMake](https://blog.dshevchenko.biz/2011/09/19/cmake.html)
- [Темы раздела "CMake" на stackoverflow documentation](http://stackoverflow.com/documentation/cmake/topics)
- [Индексная страница справки на cmake.org](https://cmake.org/cmake/help/v3.0/)

Справка по qmake:

- [Индексная страница qmake manual (doc.qt.io)](http://doc.qt.io/qt-5/qmake-manual.html)
- [Undocumented qmake (wiki.crossplatform.ru)](http://www.wiki.crossplatform.ru/index.php/Undocumented_qmake)

## Компиляторы и версии STL

Также придётся осваивать флаги двух основных компиляторов:

- компилятор G++ из состава GNU Compiler Collections
- компилятор Clang из проекта LLVM

Эти два компилятора почти полностью совместимы между собой по флагам и по уровню поддержки C++14/C++17. По сути, достаточно изучить флаги одного из компиляторов &mdash; в другом всё будет так же. Флаги системе сборки задаются через CXXFLAGS (ищите по фразам "[CMake CXXFLAGS](https://www.google.ru/search?q=CMake+CXXFLAGS)", "[qmake CXXFLAGS](https://www.google.ru/search?q=qmake+CXXFLAGS)")

Справка по GCC/G++:

- [Темы раздела "gcc" на stackoverflow documentation](http://stackoverflow.com/documentation/gcc/topics)
- [Подробный обзор стадий сборки C++ проекта (knzsoft.ru)](http://knzsoft.ru/cpp-bgr-ls1/)

В Ubuntu также доступны две версии STL:

- libstdc++ из состава GNU Compiler Collections
- libc++ из проекта LLVM

По умолчанию компиляторы G++ и Clang сами используют libstdc++. Способы переключиться на использование libc++ описаны [на странице libc++ (llvm.org)](http://libcxx.llvm.org/). Библиотека libc++ легче обновляется и может открыть доступ к новым возможностям C++14 и C++17.
