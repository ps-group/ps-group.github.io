---
title: Руководство по установке LLVM
preview: img/LLVM-Logo-Derivative-1.png
subtitle: Руководство по сборке и установке LLVM на Windows и Linux. Знакомит с примерами и утилитами в составе LLVM.
---

Ключевые шаги установки:

- получить или собрать LLVM с библиотеками, заголовками и утилитами
- запустить утилиту llvm-config
- полученные флаги добавить в настройки проекта или скрипты сборки
- изучить Kaleidoscope, llc и другие примеры кода в составе пакета исходных кодов LLVM

## Установка бинарных пакетов в Linux

В большинстве дистрибутивов GNU/Linux все библиотеки и утилиты LLVM доступны в предсобранном виде. Более того, на странице [apt.llvm.org](http://apt.llvm.org/) доступны постоянно обновляемые репозитории для Debian и Ubuntu.

- Для версии LLVM 5.0 необходимые для разработчика пакеты будут следующими: `llvm-5.0 llvm-5.0-dev llvm-5.0-runtime clang-5.0`.
- Также можно установить пакеты без явного номера версии, получив привязанную к выпуску дистрибутива версию LLVM/Clang.

## Установка бинарных пакетов в Windows

Для Windows проект LLVM/Clang предоставляет инсталлятор Clang, найти который можно на странице [releases.llvm.org](http://releases.llvm.org/). К сожалению, инсталлятор не предоставляет библиотек и заголовочных файлов LLVM. Для работы с API LLVM, а не с утилитами, потребуется собрать LLVM самостоятельно.

Установить библиотеки LLVM можно с помощью пакетного менеджера NuGet в составе Visual Studio, нужный пакет есть на странице [nuget.org/packages/LLVMLibs](http://www.nuget.org/packages/LLVMLibs)

## Сборка через CMake

- Загрузить архив исходников можно на странице [releases.llvm.org](http://releases.llvm.org/)
- На сайте LLVM есть детальная инструкция по работе с CMake: [llvm.org/docs/CMake.html](http://llvm.org/docs/CMake.html)

CMake используется как основная система сборки для LLVM на всех системах. 

> CMake представляет собой целый пакет программ и утилит. Система сборки реализуется утилитой командной строки — `cmake.exe` на Windows и `cmake` на UNIX. CMake не умеет собирать исходный код самостоятельно и генерирует входные файлы для другой системы сборки, такой как GNU Make (на Linux), xcodebuild (на MacOSX) или msbuild (на Windows)

- для сборки под Windows или MacOSX разработчик генерирует проекты для Visual Studio или XCode соответственно, и затем собирает привычным способом
- для сборки под Linux разработчик генерирует Makefile и запускает `make`

Примеры вызова утилиты cmake:

```bash
# Вызов генератора проектов Visual Studio 2015 (кодовая версия 14),
#  платформа по умолчанию, т.е. Intel 32bit
# Основной файл CMakeLists.txt проекта находится в текущем каталоге
# На выходе: файлы *.vcxproj и *.sln в текущем каталоге
cmake -G "Visual Studio 14" .

# Вызов генератора проектов Visual Studio 2017 (кодовая версия 15),
#  платформа AMD64 (64-битная для Intel и AMD)
# Основной файл CMakeLists.txt проекта находится в каталоге "../src"
# На выходе: файлы *.vcxproj и *.sln в текущем каталоге
cmake -G "Visual Studio 15 Win64" ../src

# Вызов генератора проектов по умолчанию (на Linux - Make с системным компилятором)
# Основной файл CMakeLists.txt проекта находится в текущем каталоге
# Опция CMAKE_BUILD_TYPE выставляется равной Release, что приводит к сборке релизной конфигурации
# На выходе: на Linux - Makefile в текущем каталоге
cmake -DCMAKE_BUILD_TYPE=Release .
# Запуск сборки Makefile (-s - тихий режим без подробных сообщений)
make -s
```

## Сборка и установка на Windows

Допустим, вы распаковали исходный код LLVM в каталог llvm-src на Windows с Visual Studio 2017. Тогда можно создать каталоги llvm-build и llvm-install, и из каталога llvm-build вызвать:

```bash
cmake -G "Visual Studio 15 Win32" cmake -DCMAKE_INSTALL_PREFIX=../llvm-install -DCMAKE_BUILD_TYPE=Release ../llvm-src
```

- После откройте `LLVM.sln` в Visual Studio и соберите либо весь Solution, либо проекты llc и llvm-config.
- Для установки LLVM в каталог llvm-install соберите мета-проект `CMakePredefinedTargets\PACKAGE`

## Установка после сборки на Linux

Для установки собранного LLVM лучше всего использовать checkinstall, который, в отличии от make install, создаст нормальный Debian-пакет, который затем можно удалить. При запуске checkinstall без параметров утилита сама предложит ввести название пакета, версию, описание и другие атрибуты, а в конце соберёт deb-пакет и установит его.

Чтобы избежать сюрпризов, можно явно указать параметры генерации пакета. Команда, приведённая ниже, создаст и установит пакет llvm-custom:

```cpp
# -D - генерировать в формате deb.
# -y - выбирать опции пакета по умолчанию, а не спрашивать пользователя
# --nodoc - исключить файлы документации
# --strip --stripso - удалять отладочную информацию из бинарников и разделяемых библиотек
# --pkgname=<NAME> - название пакета
# --pkgversion=<VERSION> - версия пакета, обычно берётся из версии проекта в формате a.b.c
# --pkgrelease=<RELEASE> - версия пакета данной версии проекта, фактически любая строка
checkinstall -D -y --nodoc --strip --stripso \
    --pkgname=llvm-custom \
    --pkgname=3.8.1 \
    --pkgrelease=latest \
```

## Утилита llvm-config

Утилита llvm-config хранит жёстко зашитые при сборке параметры собранного дистрибутива LLVM.

При вызове с параметром `--includedir` утилита выводит путь к заголовочным файлам LLVM, который можно добавить в настройки проекта или скрипты сборки.

При вызове с параметром `--libs` утилита выводит список доступных для компоновщика библиотек LLVM, оформленный в виде флагов GCC-совместимого компоновщика.

```
-lLLVMLTO -lLLVMObjCARCOpts -lLLVMSymbolize -lLLVMDebugInfoPDB -lLLVMDebugInfoDWARF -lLLVMXCoreDisassembler -lLLVMXCoreCodeGen -lLLVMXCoreDesc -lLLVMXCoreInfo -lLLVMXCoreAsmPrinter -lLLVMSystemZDisassemble -lLLVMSystemZCodeGen -lLLVMSystemZAsmParser -lLLVMSystemZDesc -lLLVMSystemZInfo -lLLVMSystemZAsmPrinter -lLLVMSparcDisassembler -lLLVMSparcCodeGen -lLLVMSparcAsmParser -lLLVMSparcDesc -lLLVMSparcInfo -lLLMSparcAsmPrinter -lLLVMPowerPCDisassembler -lLLVMPowerPCCodeGen -lLLVMPowerPCAsmParser -lLLVMPowerPCDesc -lLLVMPowerPCInfo -lLLVMPowerPCAsmPrinter -lLLVMNVPTXCodeGen -lLLVMNVPTXDesc -lLLVMNVPTXInfo -lLLVMNPTXAsmPrinter -lLLVMMSP430CodeGen -lLLVMMSP430Desc -lLLVMMSP430Info -lLLVMMSP430AsmPrinter -lLLVMMipsDisassembler -lLLVMMipsCodeGen -lLLVMMipsAsmParser -lLLVMMipsDesc -lLLVMMipsInfo -lLLVMMipsAsmPrinter -lLVMHexagonDisassembler -lLLVMHexagonCodeGen -lLLVMHexagonAsmParser -lLLVMHexagonDesc -lLLVMHexagonInfo -lLLVMCppBackendCodeGen -lLLVMCppBackendInfo -lLLVMBPFCodeGen -lLLVMBPFDesc -lLLVMBPFInfo -lLLVMBPFAsmrinter -lLLVMARMDisassembler -lLLVMARMCodeGen -lLLVMARMAsmParser -lLLVMARMDesc -lLLVMARMInfo -lLLVMARMAsmPrinter -lLLVMAMDGPUCodeGen -lLLVMAMDGPUAsmParser -lLLVMAMDGPUDesc -lLLVMAMDGPUUtils -lLLVMAMDGPUInf -lLLVMAMDGPUAsmPrinter -lLLVMAArch64Disassembler -lLLVMAArch64CodeGen -lLLVMAArch64AsmParser -lLLVMAArch64Desc -lLLVMAArch64Info -lLLVMAArch64AsmPrinter -lLLVMAArch64Utils -lLLVMMIRParser -lLLVMLibDriverLLVMOption -lgtest_main -lgtest -lLLVMTableGen -lLLVMLineEditor -lLLVMX86Disassembler -lLLVMX86AsmParser -lLLVMX86CodeGen -lLLVMSelectionDAG -lLLVMAsmPrinter -lLLVMX86Desc -lLLVMMCDisassembler -lLLVMX86Ino -lLLVMX86AsmPrinter -lLLVMX86Utils -lLLVMMCJIT -lLLVMPasses -lLLVMipo -lLLVMVectorize -lLLVMLinker -lLLVMIRReader -lLLVMAsmParser -lLLVMDebugInfoCodeView -lLLVMInterpreter -lLLVMCodeGen -lLLVMScalarOptslLLVMInstCombine -lLLVMInstrumentation -lLLVMProfileData -lLLVMBitWriter -lLLVMOrcJIT -lLLVMTransformUtils -lLLVMExecutionEngine -lLLVMTarget -lLLVMAnalysis -lLLVMRuntimeDyld -lLLVMObject -lLLVMMCParser -lLVMBitReader -lLLVMMC -lLLVMCore -lLLVMSupport
```

- Для подключения библиотек к проекту Visual Studio вы можете
    1. скопировать полученный от llvm-config список в текстовый редактор
    2. с помощью Find/Replace заменить формат `-lAA -lBB` на `AA.lib\nBB.lib\n`
    3. добавить изменённый список в настройки проекта в раздел "Linker->Input"
- Не пытайтесь скопировать список из примера выше: на вашей системе он может отличаться

При вызове без параметров утилита выдаёт справку:

```bash
usage: llvm-config <OPTION>... [<COMPONENT>...]

Get various configuration information needed to compile programs which use
LLVM.  Typically called from 'configure' scripts.  Examples:
  llvm-config --cxxflags
  llvm-config --ldflags
  llvm-config --libs engine bcreader scalaropts

Options:
  --version         Print LLVM version.
  --prefix          Print the installation prefix.
  --src-root        Print the source root LLVM was built from.
  --obj-root        Print the object root used to build LLVM.
  --bindir          Directory containing LLVM executables.
  --includedir      Directory containing LLVM headers.
  --libdir          Directory containing LLVM libraries.
  --cmakedir        Directory containing LLVM cmake modules.
  --cppflags        C preprocessor flags for files that include LLVM headers.
  --cflags          C compiler flags for files that include LLVM headers.
  --cxxflags        C++ compiler flags for files that include LLVM headers.
  --ldflags         Print Linker flags.
  --system-libs     System Libraries needed to link against LLVM components.
  --libs            Libraries needed to link against LLVM components.
  --libnames        Bare library names for in-tree builds.
  --libfiles        Fully qualified library filenames for makefile depends.
  --components      List of all possible components.
  --targets-built   List of all targets currently built.
  --host-target     Target triple used to configure LLVM.
  --build-mode      Print build mode of LLVM tree (e.g. Debug or Release).
  --assertion-mode  Print assertion mode of LLVM tree (ON or OFF).
  --build-system    Print the build system used to build LLVM (always cmake).
  --has-rtti        Print whether or not LLVM was built with rtti (YES or NO).
  --has-global-isel Print whether or not LLVM was built with global-isel support (ON or OFF).
  --shared-mode     Print how the provided components can be collectively linked (`shared` or `static`).
  --link-shared     Link the components as shared libraries.
  --link-static     Link the component libraries statically.
  --ignore-libllvm  Ignore libLLVM and link component libraries instead.
Typical components:
  all               All LLVM libraries (default).
  engine            Either a native JIT or a bitcode interpreter.
```

## Изучаем дистрибутив LLVM

### Язык LLVM-IR

LLVM-IR — это промежуточный язык компиляторов, использующих библиотеки LLVM, именно с ним работают ключевые подсистемы LLVM. Язык поддерживает:

- инструкции, близкие к ассемблерным
- функции с параметрами и возвращаемым значением и их атрибуты
- структуры и массивы
- примитивные типы, например, целые числа от i1 (1-битное) до i64 (64-битное)
- в присваивании участвуют не переменные, а регистры — считается, что в LLVM бесконечно много регистров
- имена регистров локальные для функции, обычно генератор кода генерирует имена с помощью возрастающего ряда чисел
- присваивать регистр может только одна инструкция в пределах функции, для присваивания в цикле потребуется снова прыгнуть на эту инструкцию

В языке нет ни выражений, ни ООП, поскольку из LLVM-IR без излишних преобразований генерируется машинный код. Оптимизаторы кода в составе LLVM работают именно с LLVM-IR.

```llvm
; Function Attrs: nounwind uwtable
define i32 @add(i32 %a, i32 %b) #0 {
  %1 = alloca i32, align 4
  %2 = alloca i32, align 4
  store i32 %a, i32* %1, align 4
  store i32 %b, i32* %2, align 4
  %3 = load i32, i32* %1, align 4
  %4 = load i32, i32* %2, align 4
  %5 = add nsw i32 %3, %4
  ret i32 %5
}

```

### Пример Kaleidoscope

В состав дистрибутива LLVM включён пример Kaleidoscope (см. каталоги и проекты Kaleidoscope, Kaleidoscope-Ch2, Kaleidoscope-Ch3 и так далее). Для этих же примеров есть актуальные статьи на английском языке: [llvm.org/docs/tutorial](http://llvm.org/docs/tutorial/).

Пример реализует полноценный компилятор с кодогенерацией через LLVM. Особенности примера:

- фронтенд компилятора сильно упрощён, лексер и парсер написаны вручную
- для простоты примера используются глобальные переменные, от которых легко избавиться средствами ООП
- бекенд компилятора построен на библиотеках LLVM, для генерации и обработки промежуточного кода использует API библиотек LLVM
- есть поддержка выражений (включая if-выражение, эквивалентное тернарному оператору)
- есть поддержка инструкции for
- есть поддержка вызова внешних функций, написанных на языке C
- показан полный цикл кодогенерации, включая генерацию отладочной информации

### Утилита llc

Утилита llc получает на вход LLVM-IR код и создаёт машинный код. Благодаря этому она служит прекрасным примером для создания финальной стадии бекенда: генератора машинного кода.

- код прост и понятен, и не содержит внутренней логики обработки данных
- в своём проекте алгоритм можно упростить ещё сильнее, убрав обработку ненужных вашему компилятору опций командной строки
- исходный код незначительно меняется от версии к версии в связи с изменениями в LLVM API

### Компиляция из C/C++ в LLVM-IR

Компилятор clang способен компилировать из C/C++ в текстовое представление LLVM-IR, что позволяет исследовать способы генерации кода из различных высокоуровневых конструкций. По умолчанию clang компилирует без оптимизаций, то есть сгенерированный при обходе AST код не искажается проходами оптимизатора.

Допустим, есть файл main.cpp:

```cpp
#include <stdio.h>

int main()
{
    const char message[] = "Hello, World!";
    puts(message);
}
```

Команда для компиляции:

```bash
clang++ -S -emit-llvm main.cpp
```

На выходе создаётся файл main.ll с текстовым представлением LLVM-IR:

```llvm
; ModuleID = 'main.cpp'
target datalayout = "e-m:e-i64:64-f80:128-n8:16:32:64-S128"
target triple = "x86_64-pc-linux-gnu"

@_ZZ4mainE7message = internal constant [14 x i8] c"Hello, World!\00", align 1

; Function Attrs: norecurse uwtable
define i32 @main() #0 {
  %1 = call i32 @puts(i8* getelementptr inbounds ([14 x i8], [14 x i8]* @_ZZ4mainE7message, i32 0, i32 0))
  ret i32 0
}

declare i32 @puts(i8*) #1

attributes #0 = { norecurse uwtable "disable-tail-calls"="false" "less-precise-fpmad"="false" "no-frame-pointer-elim"="true" "no-frame-pointer-elim-non-leaf" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+fxsr,+mmx,+sse,+sse2" "unsafe-fp-math"="false" "use-soft-float"="false" }
attributes #1 = { "disable-tail-calls"="false" "less-precise-fpmad"="false" "no-frame-pointer-elim"="true" "no-frame-pointer-elim-non-leaf" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+fxsr,+mmx,+sse,+sse2" "unsafe-fp-math"="false" "use-soft-float"="false" }

!llvm.ident = !{!0}

!0 = !{!"clang version 3.8.0-2ubuntu4 (tags/RELEASE_380/final)"}
```
