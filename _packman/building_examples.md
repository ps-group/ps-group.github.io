---
title: 'Сборка примеров из репозитория'
---

Для сборки примеров непосредственно из [репозитория sfml-packman](https://github.com/PS-Group/sfml-packman) потребуется CMake.

Свои работы можно делать без CMake. Также можно обойтись без CMake, если самостоятельно создавать нужные проекты Visual Studio.

Если вы всё же хотите использовать CMake, следуйте инструкциям ниже

## Установка CMake

- Скачайте Cmake [с официального сайта](https://cmake.org/download/)
- При установке не забудьте поменять опцию, чтобы путь к CMake был добавлен в переменную [PATH](http://superuser.com/questions/284342/what-are-path-and-other-environment-variables-and-how-can-i-set-or-use-them)

![Скриншот](img/cmake_add_to_path.png)

- Переменные окружения, такие как [PATH](http://superuser.com/questions/284342/what-are-path-and-other-environment-variables-and-how-can-i-set-or-use-them), передаются приложению при старте. Если вы поменяли переменную PATH, изменения вступят в силу после перезапуска программ.

## Сборка примеров на Windows через CMake

- склонируйте репозиторий (допустим, каталог с клоном называется `sfml-packman`)
- перейдите в консоли (или в Far Manager) в каталог sfml-packman, создайте подкаталог для сборки (например, build) и перейдите в этот подкаталог
- запустите команду `cmake -G "Visual Studio 14" ".."`
- откройте сгенерированное решение `build\sfml-packman.sln` в Visual Studio
- при необходимости надо настроить пути к библиотекам, после чего собрать
