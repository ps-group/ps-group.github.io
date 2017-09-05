---
title: 'Установка библиотек для MacOSX'
subtitle: 'Краткая инструкция по установке всех нужных для курса библиотек на MacOSX'
draft: true
---

> ПРЕДУПРЕЖДЕНИЕ: руководство не проверено на настоящей машине с MacOSX, некоторые пункты могут не соответствовать действительности.

## Установка XCode

В MacOSX простейший способ получить компилятор C++ — установить XCode из AppStore.

После установки нужно установить пакет XCode Command-Line Tools. Для этого выполните в терминале команду:

```bash
xcode-select --install
```

## Установка Homebrew

Установка C++ библиотек будет выполняться с помощью Homebrew. Для установки Homebrew перейдите на [сайт brew.sh](https://brew.sh/) и выполните предлагаемый там однострочный скрипт.

После установки в терминале вам доступна команда brew:

```bash
# Поиск библиотек, в названии которых есть подстрока "boost" 
brew search boost

# Вывод информации о дополнительных опциях установки пакета
brew info boost

# Установка библиотеки boost
brew install boost
```

Команда `brew info boost` выводит информацию об опциях:

```
...
--without-python
    Build without Boost.Python module
...
```

## Установка библиотек, доступных в Homebrew

Множество C/C++ библиотек доступно в виде формул Homebrew. Следующие библиотеки используются в нашем курсе:

- [Assimp](http://brewformulas.org/Assimp) для загрузки 3D моделей из множества форматов файлов
- [SDL2](http://brewformulas.org/Sdl2), [SDL2 image](http://brewformulas.org/Sdl2Image), [SDL2 mixer](http://brewformulas.org/Sdl2Mixer), [SDL2 TTF](http://brewformulas.org/Sdl2Ttf) в целях абстрагирования от операционной системы для создания окон, растеризации текстовых надписей, загрузки изображений с диска, загрузки и проигрывания звуковых файлов
- [GLbinding](http://brewformulas.org/Glbinding) для прозрачного подключения нужной версии API OpenGL без необходимости вручную работать с механизмом расширений OpenGL
- [Tinyxml 2](http://brewformulas.org/Tinyxml2) для загрузки XML
- [Bullet 2](http://brewformulas.org/Bullet) для расчёта столкновений в 3D пространстве
- [GLM](http://brewformulas.org/Glm) для работы с линейной алгеброй в рамках задач 3D графики

Команда для установки библиотек может выполняться долго, т.к. сборка занимает длительное время:

```bash
brew install assimp sdl2 sdl2_image sdl2_mixer sdl2_ttf glbinding tinyxml2 bullet glm
```

## Библиотека anax

Библиотека используется для построения архитектуры программы на принципах Component-Entity-System.

TODO: описать процесс

## Библиотека nlohmann-json

Библиотека используется для загрузки и сохранения JSON.

TODO: описать процесс
