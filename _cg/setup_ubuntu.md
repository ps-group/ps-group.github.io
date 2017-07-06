---
title: 'Установка библиотек для Ubuntu'
subtitle: 'Краткая инструкция по установке всех нужных для курса библиотек в Ubuntu'
redirect_from: '/opengl/ubuntu_env'
---

На Linux рекомендуется использовать:

- последнюю версию компилятора clang
- последнюю версию системы сборки cmake
- среду разработки CLion либо QtCreator

Студенты могут получить бесплатную лицензию на CLion, используя скан студенческого билета: [jetbrains.com/student/](https://www.jetbrains.com/student/)

## Библиотеки из основного репозитория

Множество C/C++ библиотек доступно в основном репозитории системы (предполагаем, что вы используете Ubuntu 16.04 LTS или старше). Следующие библиотеки используются в нашем курсе:

- sdl2, sdl2-image, sdl2-mixer, sdl2-ttf в целях абстрагирования от операционной системы для создания окон, растеризации текстовых надписей, загрузки изображений с диска, загрузки и проигрывания звуковых файлов
- assimp3 для загрузки 3D моделей из множества форматов файлов
- bullet3 для расчёта столкновений в 3D пространстве
- tinyxml2 для загрузки XML
- glm для работы с линейной алгеброй в рамках задач 3D графики

Команда для установки данных библиотек:

```bash
>sudo apt-get install libtinyxml2-dev libassimp-dev libbullet-dev libglm-dev
```

## Библиотека SFML

Рекомендуется использовать самую новую версию SFML. Для этого нужно [скачать на sfml-dev.org](https://www.sfml-dev.org/download.php) архив с исходным кодом SFML и собрать его с помощью CMake.

```bash
# Установим зависимости для сборки
sudo apt-get install libfreetype6-dev libpng-dev
# Собираем SFML из исходного кода
cmake --DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF .
cmake --build . -- -j4

# Устанавливаем, создавая пакет libsfml-dev-custom версии 2.4.2
sudo checkinstall -D \
    -y --strip --stripso --nodoc \
    --pkgname=libsfml-dev-custom \
    --pkgversion=2.4.2 \
    --pkgrelease=git \
    --deldesc=no
```

## Библиотека glbinding

> Источник: [github.com/cginternals/glbinding/#install-instructions](https://github.com/cginternals/glbinding/#install-instructions)

Библиотека даёт прозрачный доступ к современным версиям OpenGL: программист использует API нужной ему версии, а glbinding сам запросит адреса функций выбранной версии у видеодрайвера. Рекомендуется использовать glbinding вместо обычных заголовков OpenGL.

Пакеты распространяются в специальном ppa. Подключить ppa и установить пакеты можно следующими командами:

```bash
sudo apt-add-repository ppa:cginternals/ppa
sudo apt-get update
sudo apt-get install libglbinding-dev libglbinding-dbg
```

После этого в CMake вы можете использовать find_package:

```bash
find_package(glbinding REQUIRED)
# Экспортирует GLBINDING_LIBRARIES и GLBINDING_INCLUDES

target_link_libraries(${target} ... ${GLBINDING_LIBRARIES})
```

## Библиотека anax

Библиотека используется для построения архитектуры программы на принципах Component-Entity-System. Для сборки склонируйте репозиторий и в каталоге клона вызовите cmake:

```
git clone https://github.com/miguelmartin75/anax.git
cd anax
cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=false .
cmake --build .
```

Далее выполните команду checkinstall, чтобы создать DEB-пакет "libanax-dev-custom" и установить его.

```bash
sudo checkinstall -D \
    -y --strip --stripso --nodoc \
    --pkgname=libanax-dev-custom \
    --pkgversion=2.1.0 \
    --pkgrelease=git \
    --deldesc=no
```

В установленном пакете находятся заголовки `<anax/*.h>` по пути `/usr/local/include/` и библиотека `libanax_s.a`.

## Библиотека nlohmann-json

Библиотека используется для загрузки и сохранения JSON. Для сборки склонируйте репозиторий и в каталоге клона вызовите cmake:

```
git clone https://github.com/nlohmann/json.git
cd json
cmake -DBuildTests=OFF .
```

Далее выполните команду checkinstall, чтобы создать DEB-пакет "libnlohmann-json-dev-custom" и установить его.

```bash
sudo checkinstall -D \
    -y --nodoc \
    --pkgname=libnlohmann-json-dev-custom \
    --pkgversion=2.1.1 \
    --pkgrelease=git \
    --deldesc=no
```

Если команда завершилась успешно, вы можете начать использовать `#include <nlohmann/json.hpp>` в своих проектах.

## Установка последней версии cmake

> Рекомендуется также прочитать статью [Современный CMake: 10 советов по улучшению скриптов сборки](https://habrahabr.ru/post/330902/)

Перед началом удалите существующую версию CMake: `sudo apt-get remove cmake`.

Зайдите на [страницу загрузки (cmake.org)](https://cmake.org/download/) и скачайте пакет "Unix/Linux Source" актуальной версии. Распакуйте скачанный архив, перейдите в каталог и выполните следующие команды:

```bash
./configure
make -s -j4
```

Далее выполните команду checkinstall, чтобы создать DEB-пакет "cmake-custom" и установить его. Также вам нужно удалить системный пакет cmake перед началом установки.

```bash
# Удаляем существующую версию CMake
sudo apt-get remove cmake

# Создаём и устанавливаем пакет cmake-custom-3.8.2
sudo checkinstall -D \
    -y --strip --stripso --nodoc \
    --pkgname=cmake-custom \
    --provides=cmake \
    --pkgversion=3.8.2 \
    --pkgrelease=latest \
    --deldesc=no
```

Если скрипт завершился успешно, проверьте версию cmake в системе командой `cmake --version`:

```bash
>cmake --version
cmake version 3.8.1

CMake suite maintained and supported by Kitware (kitware.com/cmake).
```

## Установка последней версии clang

Вы можете скачать исходники LLVM/Clang из SVN и собрать, а затем установить с помощью checkinstall. Готовые скрипты для автоматизации этой задачи вы найдёте на странице [gist.github.com/sergey-shambir/a075161d774e211e1a423826764c7d33](https://gist.github.com/sergey-shambir/a075161d774e211e1a423826764c7d33) Для работы скриптов нужны установленные пакеты subversion, cmake и checkinstall.

- скрипт `get_clang.sh` скачивает исходный код LLVM/Clang и собирает через CMake
- скрипт `install_clang.sh` должен быть запущен через sudo, он соберёт и установит DEB-пакет "llvm-clang-custom"
- файлы `postinstall-pak` и `preremove-pak` должны находиться рядом с `install_clang.sh` при сборке пакета

Также вам нужно удалить системные пакеты llvm и clang перед началом установки.

Если оба скрипта завершились успешно, проверьте версию clang в системе командой `clang++ --version`:

```bash
>clang++ --version
clang version 4.0.0 (branches/release_40 298273)
Target: x86_64-unknown-linux-gnu
Thread model: posix
InstalledDir: /usr/local/bin
```

## Используем clang по всей системе

Если у вас установлен clang, вы можете включить его в качестве компилятора по умолчанию:

```bash
# Выбор компилятора C++ по умолчанию
sudo update-alternatives --config c++
# Выбор компилятора C по умолчанию
sudo update-alternatives --config cc
```

В появившемся консольном меню выберите clang:

```
  Selection    Path              Priority   Status
------------------------------------------------------------
* 0            /usr/bin/g++       20        auto mode
  1            /usr/bin/clang++   10        manual mode
  2            /usr/bin/g++       20        manual mode
```
