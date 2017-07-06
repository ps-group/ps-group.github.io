---
title: 'Шпаргалка по CMake'
---

## Терминология

- Файл `CMakeLists.txt` служит скриптом (рецептом, сценарием) сборки проекта. Обычно один такой файл собирает все исходники в своём каталоге и в подкаталогах, при этом подкаталоги могут содержать, а могут не содержать дочерние файлы `CMakeLists.txt`. С точки зрения IDE, таких как CLion или Visual Studio, файл `CMakeLists.txt` также служит проектом, с которым работает программист внутри IDE.
- В cmake есть "цель" ("target") - компонент, который следует собрать. Компонент может быть исполняемым файлом, так и статической либо динамической библиотекой.
- В cmake есть "проект" ("project") - это набор компонентов, по смыслу похожий на Solution в Visual Studio.
- В cmake есть "флаги" (flags) - это аргументы командной строки для компилятора, компоновщика и других утилит, вызываемых при сборке.
- В cmake есть переменные, и в процессе интерпретации файла `CMakeLists.txt` система сборки cmake вычисляет ряд встроенных переменных для каждой цели, тем самым получая флаги. Затем cmake создаёт вторичный скрипт сборки, который будет напрямую вызывать компилятор, компоновщик и другие утилиты с вычисленными флагами.

## Сборка проекта из командной строки (Linux)

На первом шаге проект нужно сконфигурировать, то есть создать финальный скрипт сборки, запустив `cmake <параметры> <путь-к-каталогу>` в будущем каталоге сборки.

```bash
# Сейчас мы в каталоге `myapp` с файлом CMakeLists.txt
# Создадим каталог `myapp-release` и перейдём в него.
mkdir --parents ../myapp-release
cd ../myapp-release

# Сконфигурируем проект для сборки в Release.
# Флаг установит опцию CMAKE_BUILD_TYPE в значение "Release",
#  интерпретатор cmake считает это переключением на Release конфигурацию.
cmake -DCMAKE_BUILD_TYPE=Release ../myapp
```

На втором шаге нужно запустить финальный скрипт. Не вызывайте `make`! Утилита cmake сделает это сама:

```bash
# Просим CMake запустить сборку в каталоге `myapp-release`
# Можно добавить флаг `--target mylibrary` для сборки только mylibrary
# Можно добавить флаг `--clean-first`, чтобы в начале новой сборки
#  стирать остатки предыдущей.
cmake --build .

# Аналогичный способ для GNU/Linux. Его по привычке советуют в сети, хотя
#  make доступен не всегда, а cmake --build работает на всех платформах.
make
```

## Структура CMakeLists.txt

В начале главного файла `CMakeLists.txt` ставят метаинформацию о минимальной версии CMake и названии проекта:

```bash
# Указывайте последнюю доступную вам версию CMake.
cmake_minimum_required(VERSION 3.8)

# Синтаксис: project(<имя> VERSION <версия> LANGUAGES CXX),
#  теги VERSION и LANGUAGES необязательные.
project(libmodel3d)
```

Затем следует список инструкций, служащих для вычисления различных переменных, создания целей сборки,
подключения проектов из подкаталогов и так далее. Например, подключить дополнительный `CMakeLists.txt`
из подкаталога можно так:

```bash
# Простая версия: подключает скрипт по пути <подкаталог>/CMakeLists.txt
add_subdirectory(<подкаталог>)

# Расширенная версия: дополнительно установит подкаталог сборки подпроекта
add_subdirectory(<подкаталог> <подкаталог сборки>)
```

Целью может стать исполняемый файл, собираемый из исходного кода

```bash
# Синтаксис: add_executable(<имя> <список исходников...>)
# Добавлять `.h` необязательно, но лучше для работы из IDE:
#  - IDE определит заголовок как часть проекта
#  - cmake будет отслеживать изменения в заголовке и пересобирать
#    проект при изменениях.
add_executable(pngconverter main.cpp PngReader.h PngReader.cpp)
```

Целью также может быть библиотека, статическая или динамическая.

```bash
# Синтаксис: add_library(<имя> [STATIC|SHARED|INTERFACE] <список исходников...>)

# Тип библиотеки (staic или shared) зависит от параметров сборки
add_library(libpngutils PngUtils.h PngUtils.cpp)

# Тип библиотеки: static
add_library(libpngtools STATIC PngTools.h PngTools.cpp)
```

## Автогенерация проекта для Visual Studio (Windows)

Если используется Visual C++, то путь немного другой: на шаге конфигурирования создаётся проект для Visual Studio, который затем можно собрать из IDE либо так же из командной строки.

> Созданный проект Visual Studio нельзя изменять и использовать постоянно, потому что при генерации проекта используются абсолютные пути и другие неприемлемые для постоянной работы вещи.

```bash
# Сейчас мы в каталоге `myapp` с файлом CMakeLists.txt
# Сгенерируем проект Visual Studio для сборки.
mkdir --parents ../myapp-build
cd ../myapp-build

# Конфигурируем для сборки с Visual Studio 2017, версия тулчейна v140
cmake -G "Visual Studio 2017"
```

Если проект был сконфигурирован успешно, то в каталоге `../myapp-build` появятся автосгенерированный BUILD_ALL.sln и проекты для Visual Studio. Их можно открыть к IDE, либо собрать из командной строки с помощью cmake. Названия опций говорят сами за себя:

```bash
cmake --build . \
    --target myapp \
    --config Release \
    --clean-first
```

## Зависимости между библиотеками и приложениями

Не используйте директивы `include_directories`, `add_definitions`, `add_compile_options`!
Они меняют глобальные настройки для всех целей, это создаёт проблемы при масштабировании.

- Используйте [target_link_libraries](https://cmake.org/cmake/help/latest/command/target_link_libraries.html) для добавления статических и динамических библиотек, от которых зависит цель
- Используйте [target_include_directories](https://cmake.org/cmake/help/latest/command/target_include_directories.html) вместо include_directories для добавления путей поиска заголовков, от которых зависит цель
- Используйте [target_compile_definitions](https://cmake.org/cmake/help/latest/command/target_compile_definitions.html) вместо add_definitions для добавления макросов, с которыми собирается цель
- Используйте [target_compile_options](https://cmake.org/cmake/help/latest/command/target_compile_options.html) для добавления специфичных флагов компилятора, с которыми собирается цель

Пример:

```bash
# Добавляем цель - статическую библиотеку
add_library(mylibrary STATIC \
    ColorDialog.h ColorDialog.cpp \
    ColorPanel.h ColorPanel.cpp)

# ! Осторожно - непереносимый код !
# Добавляем к цели путь поиска заголовков /usr/include/wx-3.0
# Лучше использовать find_package для получения пути к заголовкам.
target_include_directories(mylibrary /usr/include/wx-3.0)
```

Вы можете выбирать область видимости настройки:

- `PUBLIC` делает настройку видимой для текущей цели и для всех зависящих от неё целей
- `PRIVATE` делает настройку видимой только для текущей цели
- `INTERFACE` делает настройку видимой только для всех зависящих от неё целей

Пример использования областей видимости:

```bash
# Каталог include будет добавлен к путям поиска заголовков в текущей цели и во всех зависимых целях
target_include_directories(myTarget PUBLIC ./include)

# Каталог src будет добавлен к путям поиска заголовков только в текущей цели
target_include_directories(myTarget PUBLIC ./src)
```

Схема зависимостей условного проекта:

![Схема](img/cmake_dependencies.png)

## Выбор стандарта и диалекта C++

Для настройки стандарта и флагов языка C++ не добавляйте флаги напрямую!

```bash
# ! Устаревший метод - прямое указание флага !
target_compile_options(hello PRIVATE -std=c++11)
```

В CMake версии 3.8+ вы можете прямо потребовать включить нужный стандарт:

```bash
# Источник: https://cmake.org/cmake/help/latest/prop_gbl/CMAKE_CXX_KNOWN_FEATURES.html

# Включаем C++ 2017
target_compile_features(myapp cxx_std_17)

# Альтернатива: включаем C++ 2014
target_compile_features(myapp cxx_std_14)

# Альтернатива: включаем C++ 2011
target_compile_features(myapp cxx_std_11)
```

В CMake версии до 3.7 включительно можно использовать `set_target_properties` (если не работает, то у вас слишком старый CMake):

```bash
# Стандарт: C++ 2014, расширения языка от производителя компилятора отключены
set_target_properties(myapp PROPERTIES
    CXX_STANDARD 14
    CXX_STANDARD_REQUIRED YES
    CXX_EXTENSIONS NO
)
```

Для разработчиков библиотек есть более тонкий контроль над возможностями языка:

```bash
# API библиотеки (т.е. заголовки) требуют лямбда-функций и override,
#  реализация библиотеки требует ещё и range-based for.
target_compile_features(mylibrary PUBLIC cxx_override cxx_lambdas PRIVATE cxx_range_for)
```

## Функции в CMake

CMake позволяет объявлять функции командами `function(name) / endfunction()` и макросы командами `macro(name) / endmacro()`. Предпочитайте функции, а не макросы, т.к. у функций есть своя область видимости переменных, а у макросов - нет.

```bash
function(hello_get_something var_name)
  ...
  # Установить переменную в области видимости вызывающей стороны
  #  можно с помощью тега PARENT_SCOPE
  set(${var_name} ${ret} PARENT_SCOPE)
endfunction()
```

## Добавление исходников к цели с target_sources

Лучше добавлять специфичные исходники с помощью target_sources, а не с помощью дополнительных переменных.

```bash
add_library(hello hello.cxx)

if(WIN32)
  target_sources(hello PRIVATE system_win.cxx)
elseif(UNIX)
  target_sources(hello PRIVATE system_posix.cxx)
else()
  target_sources(hello PRIVATE system_generic.cxx)
endif()
```

## Интерфейс к утилитам командной строки

Подробнее см. [Command-Line Tool Mode](https://cmake.org/cmake/help/v3.2/manual/cmake.1.html#command-line-tool-mode)

```bash
# Создать каталог debug-build
cmake -E make_directory debug-build
# Перейти в каталог debug-build
cmake -E chdir debug-build
```

## Функция find_package

Функция find_package принимает имя библиотеки как аргумент и обращается к CMake, чтобы найти скрипт для настройки переменных данной библиотеки. В итоге при сборке либо возникает ошибка из-за того что пакет не найден, либо добавляются переменные, хранящие пути поиска заголовков, имена библиотек для компоновщика и другие параметры.

Пример подключения Boost, вызывающего встроенный в CMake скрипт [FindBoost](https://cmake.org/cmake/help/latest/module/FindBoost.html):

```cmake
# Весь Boost без указания конкретных компонентов
find_package(Boost REQUIRED)
# Теперь доступны переменные
# - Boost_INCLUDE_DIRS: пути к заголовочным файлам
# - Boost_LIBRARY_DIRS: пути к статическим/динамическим библиотекам
# - Boost_LIBRARIES: список библиотек для компоновщика
# - Boost_<C>_LIBRARY: библиотека для компоновки с компонентом <C> библиотек Boost
```

Пример подключения библиотеки Bullet с помощью встроенного скрипта [FindBullet](https://cmake.org/cmake/help/latest/module/FindBullet.html) и компоновки с приложением my_app:

```cmake
# Вызываем встроенный скрипт FindBullet.cmake
find_package(Bullet REQUIRED)

# Добавляем пути поиска заголовков к цели my_app
target_include_directories(my_app ${BULLET_INCLUDE_DIRS})

# Добавляем список библиотек для компоновки с целью my_app
target_link_libraries(my_app ${BULLET_LIBRARIES})
```
