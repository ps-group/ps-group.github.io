---
title: 'Установка окружения для разработки на C++ для Ubuntu'
subtitle: 'Инструкция работает для Ubuntu, но может частично работать и в других дистрибутивах Linux'
redirect_from: '/opengl/ubuntu_env'
draft: true
---

## 1. Редактор

Загрузите Visual Studio Code с адреса [code.visualstudio.com](https://code.visualstudio.com/).

## 2. Последняя версия G++

В первую очередь проверьте версию g++ командой `g++ --version`. Если у вас версия 7 или выше, всё в порядке. Вывод команды выглядит примерно так:

```
sergey@sergey-A17:~$ g++ --version
g++ (Ubuntu 7.2.0-1ubuntu1~16.04) 7.2.0
Copyright (C) 2017 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```

Если версия ниже 7.0, то надо обновить компилятор. Подключите PPA [ubuntu-toolchain-r](https://launchpad.net/~ubuntu-toolchain-r/+archive/ubuntu/test). Это можно сделать двумя командами:

```bash
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt-get update
```

Теперь надо установить новый компилятор:

```bash
sudo apt-get install g++-7
```

После этого надо установить новый компилятор по умолчанию:

```bash
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-7 40
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 40
```

Снова проверьте версию G++. Поскольку он доступен под разными именами, надо проверить их все.

```bash
g++ --version
c++ --version
cpp --version
gcc --version
cc --version
```

Если что-то не сходится, используйте команды:

```
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-7 40
sudo update-alternatives --install /usr/bin/c++ g++ /usr/bin/g++-7 40
sudo update-alternatives --install /usr/bin/cpp g++ /usr/bin/g++-7 40
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 40
sudo update-alternatives --install /usr/bin/cc gcc /usr/bin/gcc-7 40

sudo update-alternatives --config g++
sudo update-alternatives --config c++
sudo update-alternatives --config cpp
sudo update-alternatives --config gcc
sudo update-alternatives --config cc
```

## 3. Последняя версия CMake

Перед началом удалите существующую версию CMake, если CMake установлен: `sudo apt-get remove cmake`. Если CMake не был установлен, всё в порядке.

Далее потребуется собрать CMake вручную. Установите пакеты, необходимые для сборки:

```bash
sudo apt-get update
sudo apt-get install build-essential checkinstall
```

Зайдите на [страницу загрузки (cmake.org)](https://cmake.org/download/) и скачайте пакет "Unix/Linux Source" актуальной версии. Распакуйте загруженный архив, перейдите в каталог и выполните следующие команды:

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

## 4. Библиотека SFML

Установите пакет `libsfml-dev`:

```bash
sudo apt-get update
sudo apt-get install libsfml-dev
```
