---
title: 'FFI - механизм интеграции между языками программирования'
---

FFI (Foreign function interface) &mdash; механизм, с помощью которого код, написанный на одном языке программирования, может вызывать подпрограммы или использовать утилитные средства из кода другом языке программирования.

> Термин FFI возник в языке программирования Common Lisp, где есть явная спецификация способов взаимодействия кода с другими языками. Данный термин также используется официально в языках Haskell, Python и Perl. Другие языки могут применять другую терминологию: например, Java называет это "JNI" (Java Native Interface), а в ряде языков это называется "language bindings".

Основная задача FFI &mdash; совместить семантику и соглашения о вызове процедур и функций в двух различных языках. Для реализации потребуется учесть особенности [райнтайма](https://en.wikipedia.org/wiki/Runtime_system) и [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) в обоих языках. Есть несколько способов реализовать FFI:

- Требовать, чтобы функции, которые можно вызвать из другого языка, были объявлены определённым образом. Например, такие требования выставляют Java, а также языки платформы .NET.
- Ограничить возможности языка, сделав его подмножество совместимым с другим языком. Например, язык C++ позволяет объявлять функции, которые могут быть вызваны из языка C, но при этом функции не должны выбрасывать исключений либо принимать параметры по ссылке.
- Использовать генератор кода, такой как [SWIG](http://swig.org/), который автоматически просканирует программный модуль на одном языке и сгенерирует библиотечную обёртку для его вызова из другого языка.

Механизм FFI может столкнуться с ограничениями, а именно:

- Если один из языков использует сборку мусора, потребуется удерживать ссылки на объекты из второго языка, чтобы они не были внезапно удалены
- Сложные типы данных, такие как словари или множества, следует отобразить в соответствующие типы в другом языке, что бывает затруднительно и мешает, например, одновременно работать с одним и тем же изменяемым объектом из двух языков
- Как минимум один из языков может работать в окружении виртуальной машины или интерпретатора
- Межязыковое наследование классов и отображение других особенностей системы типов и моделей композиции объектов может быть неоднозначным или неполным

## Роль языка C89 / C99 в построении FFI

Язык C в диалектах 89-го или 99-го годов чаще всего используется как цель для FFI по ряду причин:

- в языке C нет своей системы сложных типов, таких как строка или ассоциативный массив, и нет виртуальной машины и автоматического управления памятью, что намного упрощает отображение типов
- язык C является кроссплатформенным аналогом ассемблера и напрямую может сделать всё, что может сделать ассемблер, что позволяет проектировать FFI достаточно вольно

## FFI между C++ и C

C++ вобрал в себя язык C как подмножество, и поэтому механизм FFI между ними тривиален: обычно хватает простого объявления функции с `extern "C"`:

```cpp
#ifdef __cplusplus // Если это компилятор C++, явно объявляем линковку в стиле C
extern "C" {
#endif

void PrintLn(const char *line);

void SumAllArguments(const unsigned nArgsCount, ...);

#ifdef __cplusplus // Если это компилятор C++, закрываем область линковки в стиле C
}
#endif
```

> Объявление `extern "C"` приводит к отлючению [механизма кодирования имён функций](https://en.wikipedia.org/wiki/Name_mangling), который позволяет языку C++ реализовать классы, пространства имён и перегрузку функций, при этом сохраняя совместимость с языком C. Например, при генерации кода некоторые компиляторы заменяют имя функции `format` с полной сигнатурой `std::string article::format(void)` на `_ZN7article6formatE`. Разные компиляторы на разных платформах могут иметь различные алгоритмы кодирования имён.

Функция на языке C++, вызываемая из языка C, не должна выбрасывать исключений, а также использовать в параметрах ссылки либо составные типы, не должна находиться в пространстве имён или в определении класса. Организовать отображение класса из языка C++ в язык C можно таким образом:

```cpp
#ifdef __cplusplus
extern "C" {
#endif

// Поля структуры TextScanner не раскрываются.
struct TextScanner;

// В языке C тип структуры S имеет полное имя `struct S`
//  поэтому для удобства используют трюк с typedef.
typedef stuct TextScanner TextScanner;

TextScanner *CreateScanner(unsigned options); // отображение конструктора
void DisposeScanner(TextScanner *scanner); // отображение деструктора
void Scanner_ScanFile(TextScanner *scanner, const char *pathUtf8);
void Scanner_ScanString(TextScanner *scanner, const char *textUtf8);
unsigned Scanner_GetWordsCount(TextScanner *scanner);
unsigned Scanner_GetParagraphsCount(TextScanner *scanner);

#ifdef __cplusplus
}
#endif
```

В языке C нет универсального механизма обработки ошибок, и у вас есть несколько вариантов:

- Передават код ошибки (целое число или enum) в возвращаемом функцией значении
- Накапливать подробную информацию об ошибке в собственной глобальной либо [thread local](https://en.wikipedia.org/wiki/Thread-local_storage) переменной (так поступает стандартная библиотека C, в которой есть переменая errno и вызов [strerror](https://ru.wikipedia.org/wiki/Strerror), сходным образом работает OpenGL)
- Предложить установить колбек, который будет вызываться при каждом появлении ошибки.

При приёме колбеков из языка C надо помнить о трюке с передачей контекста через `void*`. По примеру ниже нетрудно догадаться, что пользователь может передать через `void*` указатель на объект, структуру данных или любые другие контекстные данные:

```cpp
// Объявляем указатель на функцию с именем TIMER_PROCEDURE
// В параметре void* колбек получает произвольный указатель,
//  ранее переданный в SetTimerCallback
typedef void (*TIMER_PROCEDURE)(void *context);

// Вызывает указанную процедуру через intervalMS миллисекунд,
//  передаёт ей пользователький параметр context
void SetTimerCallback(unsigned intervalMS, TIMER_PROCEDURE procedure, void *context)
{
    // Тут мы как-то встраиваем в цикл событий запись о вызове процедуры таймера
    g_timers.Add(intervalMS, [=]() {
        procedure(context);
    });
}
```

## FFI между Python и C

Язык Python имеет самодостаточный интерпретатор со множеством готовых компонентов. Расширение возможностей языка Python реализуется подключением псевдо-пакетов, таких как `future` или `ctype`. Более того, многие из стандартных модулей Python, а также основная реализация интерпретатора этого языка написаны на C и C++.

Модуль [ctypes](https://docs.python.org/2/library/ctypes.html) предоставляет простой интерфейс для взаимодействия с кодом, скомпилированным из C в виде динамической библиотеки. На Windows следующий код загрузит стандартную библиотеку C как объект, методы которого эквивалентны вызовам функций библиотеки C:

```python
from ctypes import *
print cdll.msvcrt # Prints `<CDLL 'msvcrt', handle ... at ...>`
libc = cdll.msvcrt
libc.printf("%d\n", 42)
```

На Linux библиотеки приходится загружать явно с указанием как минимум имени файла, и эквивалентом будет следующий код:

```python
from ctypes import *
# Либо вызываем LoadLibrary
cdll.LoadLibrary("libc.so.6")
# Либо конструируем объект типа CDLL
libc = CDLL("libc.so.6")
libc.printf("%d\n", 42)
```

Иногда имена функций в разеляемой библиотеке не являются правильными идентификаторами Python, например, из-за кодирования имён функций в C++. Получить к ним доступ можно с помощью getattr:

```python
getattr(cdll.msvcrt, "??2@YAPAXI@Z")
```

В модуле ctype действует ряд правил отображение типов:

- `None` отображается в `NULL`
- целые числа форматов `int` и `long` из Python в C отображаются в `int`
- байтовые и юникодные строки отображаются в завершённый нулевым символом указатель на `char*` и `wchar_t` соответственно

Объявлен также ряд типов, эквивалентных базовым типам языка C:

```python
text = c_char_p("Hello, World")
count = c_long(333)
for i in xrange(0, count):
    libc.puts(text)
```

## Упражнения

Напишите на языке C++ модуль, решающий квадратные либо кубические уравнения, с адекватной обработкой ошибочных ситуаций (из разряда "уравнение не является квадратным") и различного числа корней. Внешний интерфейс данного модуля сделайте доступным в виде функций и констант языка C.

После этого напишите консольную программу, которая позволяет пользователю решать квадратные уравнения, используя написанный модуль через FFI. Вы можете выбрать один из языков, перечисленных ниже, либо согласовать с преподавателем свой вариант. При выполнении вы можете писать дополнительный код на языке C, если того требует выбраный вами механизм FFI.

- Язык Python с модулем [ctypes](https://docs.python.org/2/library/ctypes.html)

```python
import ctypes
libc = ctypes.CDLL('/lib/libc.so.6')   # under Linux/Unix
time = libc.time(None)                 # equivalent C code: t = time(NULL)
print time
```

- Язык Javascript на Node.js с использованием [node-ffi](https://github.com/node-ffi/node-ffi)

```js
var ffi = require('ffi');

var libm = ffi.Library('libm', {
  'ceil': [ 'double', [ 'double' ] ]
});
libm.ceil(1.5); // 2
```

- Язык Java с использованием либо [JNI](https://en.wikipedia.org/wiki/Java_Native_Interface), либо [JNA](https://en.wikipedia.org/wiki/Java_Native_Access)

```java
JNIEXPORT void JNICALL Java_ClassName_MethodName
  (JNIEnv *env, jobject obj)
{
    /*Implement Native Method Here*/
}
```

- Язык C# с использованием [P/Invoke](https://en.wikipedia.org/wiki/Platform_Invocation_Services)

```csharp
[DllImport("shell32.dll")]
static extern IntPtr ExtractIcon(
IntPtr hInst,
[MarshalAs(UnmanagedType.LPStr)] string lpszExeFileName,
uint nIconIndex);
```

- Язык Go с использованием [CGO](http://akrennmair.github.io/golang-cgo-slides/)

```go
package print

// #include <stdio.h>
// #include <stdlib.h>
import "C"
import "unsafe"

func Print(s string) {
    cs := C.CString(s)
    C.fputs(cs, (*C.FILE)(C.stdout))
    C.free(unsafe.Pointer(cs))
}
```

- Язык PASCAL с использованием [H2PAS](http://wiki.freepascal.org/Creating_bindings_for_C_libraries)