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
>sudo apt-get install libsdl2-dev libsdl2-image-dev libsdl2-mixer-dev \
    libsdl2-ttf-dev libtinyxml2-dev libassimp-dev libbullet-dev libglm-dev
```

## Библиотека glbinding

> Источник: [github.com/cginternals/glbinding/#install-instructions](https://github.com/cginternals/glbinding/#install-instructions)

Библиотека даёт прозрачный доступ к современным версиям OpenGL: программист использует API нужной ему версии, а glbinding сам запросит адреса функций выбранной версии у видеодрайвера. Рекомендуется использовать glbinding вместо обычных заголовков OpenGL.

Пакеты распространяются в специальном ppa:

```bash
> sudo apt-add-repository ppa:cginternals/ppa
> sudo apt-get update
> sudo apt-get install libglbinding-dev libglbinding-dbg
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

> Рекомендуется также прочитать статью [Шпаргалка по CMake](/opengl/cmake_cheatsheet)

Перед началом удалите существующую версию CMake: `sudo apt-get remove cmake`.

Зайдите на [страницу загрузки (cmake.org)](https://cmake.org/download/) и скачайте пакет "Unix/Linux Source". Распакуйте скачанный архив, перейдите в каталог и выполните следующие команды:

```bash
./configure
```

Далее выполните команду checkinstall, чтобы создать DEB-пакет "cmake-custom" и установить его. Также вам нужно удалить системный пакет cmake перед началом установки.

```bash
sudo checkinstall -D \
    -y --strip --stripso --nodoc \
    --pkgname=cmake-custom \
    --provides=cmake \
    --pkgversion=3.8.1 \
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

Данный скрипт скачает исходники Clang/LLVM с помощью SVN и соберёт их (пока что без установки). Для работы скрипта нужны установленные cmake и subversion.

```bash
#!/usr/bin/env bash

# You can enable development branch with SVN_BRANCH=trunk
SVN_BRANCH=branches/release_40

llvm_get () {
  svn co http://llvm.org/svn/llvm-project/$1/$SVN_BRANCH $2
}

BASEDIR=$(dirname $(realpath "$0"))
SRCDIR=$BASEDIR/llvm-src
BUILDDIR=$BASEDIR/llvm-src/build

mkdir -p "$BUILDDIR"
mkdir -p "$SRCDIR"

cd "$SRCDIR"
llvm_get llvm llvm
cd "$SRCDIR/llvm/tools"
llvm_get cfe clang
llvm_get lldb lldb
cd "$SRCDIR/llvm/projects"
llvm_get compiler-rt compiler-rt
llvm_get openmp openmp
llvm_get libcxx libcxx
llvm_get libcxxabi libcxxabi

cd "$BUILDDIR"
cmake "$SRCDIR" \
  -DCMAKE_BUILD_TYPE=Release \
  -DLIBCXX_ENABLE_STATIC=YES \
  -DLIBCXX_ENABLE_SHARED=NO \
  -DLIBCXX_ENABLE_STATIC_ABI_LIBRARY=ON \
  -DLIBCXX_INCLUDE_BENCHMARKS=OFF
make -s -j4
```

Следующий скрипт нужно выполнять с командой sudo, потому что он создаёт DEB-пакет "llvm-clang-custom" и устанавливает его. Также вам нужно удалить системный пакеты llvm и clang перед началом установки.

```bash
#!/usr/bin/env bash

BASEDIR=$(dirname $(realpath "$0"))
BUILDDIR=$BASEDIR/llvm-src/build

cd "$BUILDDIR"

checkinstall -D \
    -y --strip --stripso --nodoc \
    --pkgname=llvm-clang-custom \
    --provides=clang \
    --pkgversion=4.0.0 \
    --pkgrelease=svn \
    --deldesc=no
```

Если оба скрипта завершились успешно, проверьте версию clang в системе командой `clang++ --version`:

```bash
>clang++ --version
clang version 4.0.0 (branches/release_40 298273)
Target: x86_64-unknown-linux-gnu
Thread model: posix
InstalledDir: /usr/local/bin
```

## Используем clang по всей системе
