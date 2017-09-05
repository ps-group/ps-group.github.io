---
title: 'Установка WxWidgets 3.0 и создание проекта'
draft: true
---

## Ubuntu или Debian GNU/Linux

Окружение для разработки на WxWidgets на Ubuntu и Debian устанавливается с пакетами `libwxbase*-dev` и `libwxgtk*-dev`. Можете воспользоваться командой:

```
sudo apt install libwxbase*-dev libwxgtk*-dev
```

Проще всего воспользоваться системой сборки CMake - с любой другой у вас будет больше проблем. В примере ниже мы воспользовались cmake-модулем FindwxWidgets так, как предлагает [документация этого модуля на cmake.org](https://cmake.org/cmake/help/v3.0/module/FindwxWidgets.html).

```
cmake_minimum_required(VERSION 3.7.0 FATAL_ERROR)

add_executable(hello main.cpp MainFrame.h MainFrame.cpp)

# Включаем C++14 - на cmake 3.8 используйте target_compile_features(hello cxx_std_14)
set_target_properties(hello PROPERTIES
    CXX_STANDARD 14
    CXX_STANDARD_REQUIRED YES
    CXX_EXTENSIONS NO
)

find_package(wxWidgets REQUIRED)
include(${wxWidgets_USE_FILE})
target_link_libraries(hello PRIVATE ${wxWidgets_LIBRARIES})
```
