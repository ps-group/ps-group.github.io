---
title: 'А что такое Compiler Backend?'
---

Compiler Backend &mdash; один из двух ключевых компонентов компилятора, о котором можно сказать следующее:

- Backend получает на вход абстрактное синтаксическое дерево (AST), хранящее логическую модель файла исходного кода
- Backend создаёт на выходе машинный код (не исполняемый файл, а всего лишь объектный, такой как `*.obj` или `*.o`)
- Превращение AST в объектный файл происходит в три этапа: сначала из AST создаётся промежуточный код, затем промежуточный код улучшается оптимизатором, и в конце из промежуточного кода создаётся машинный

## Промежуточный код

Промежуточный код генерируется из Abstract Syntax Tree (AST) путём его обхода. Перед кодогенерацией AST должен быть полностью построен и проверен на семантическую корректность фронтендом компилятора. Основные инструменты при кодогенерации &mdash; паттерн Строитель "Builder" и шаблонизаторы.

Строитель &mdash; это объект, предоставляет интерфейс для последовательного наполнения другого объекта свойствами. Например, Code Builder может последовательно наполнять список инструкций (это более высокоуровневый подход) либо список строк генерируемого кода (более грубое решение). Строитель может иметь внутреннее состояние, например, уровень отступа или флаг, указывающий на необходимость завершения текущего блока инструкцией возврата из функции.

Шаблонизаторы получают на вход строки с якорями, параметры и создают новые строки. Таким способом можно генерировать и текстовые, и бинарные файлы (т.к. бинарный файл тоже представим как строка в однобайтовой кодировке). Простые шаблонизаторы разворачивают только переменные в строках, более сложные могут обрабатывать простые ветвления и циклы. Пример шаблона HTML-файла с переменными "TITLE" и "SCRIPT_LIST":

```html
<head>
    <title>{TITLE}</title>
    {SCRIPT_LIST}
</head>
<body>
    <canvas width="800px" height="600px">
    </canvas>
</body>
```

При генерации промежуточного кода из дерева пригождаются базовые приёмы программиста: рекурсия, стек, списки, массивы. Также пригодятся паттерн Visitor, идиома pattern matching (примером является даже обычный switch-case).

Промежуточный код близок к ассемблеру, но абстрагирован от деталей конкретного процессора и может иметь свои ограничения в синтаксисе. Пример промежуточного кода (в формате LLVM-IR):

```llvm
define i32 @lambda(i8* %parent, i32 %x) {
    %1 = bitcast i8* %parent to i32*
    %2 = load i32* %1
    ; %2 = a
    %3 = add i32 %x, %2
    ret i32 %3
}
```

> При оптимизации крайне полезно, чтобы промежуточный код не имел переменных, а использовал назначение имён для вычислимых значений (value bindings). Иными словами, каждая "переменная" вычисляется только один раз и затем не меняется (схожий механизм не случайно появился в современном Javascript в виде [ключевого слова let](https://learn.javascript.ru/let-const)). Поддержка реальных переменных реализуется на базе модели памяти языка &mdash; например, мы один раз вычисляем адрес переменной на стеке, связывам это значение с именем и затем используем инструкции для записи/чтения по вычисленному адресу. Вы можете увидеть это в примере выше &mdash; в LLVM-IR каждое именованное значение присваивается только в одной строке (возможно, внутри цикла), и является регистром виртуальной машины LLVM (считается, что в LLVM бесконечно много регистров).

## Оптимизатор

Оптимизатор &mdash; это необязательный компонент бекенда. Промышленные компиляторы содержат оптимизатор, потому что в привычном цикле разработки используются отладочные (debug) и оптимизированные (release) конфигурации сборки.

- Отладочные конфигурации не должны содержать оптимизаций кода, иначе сломается пошаговый режим отладки, но должны содержать отладочную информацию, способную сопоставить инструкцию в машинном коде и строку в файле с исходным кодом, из которой эта инструкция была получена
- Релизные конфигурации должны пройти стадию оптимизации, чтобы избавить программиста от необходимости портить читаемость кода ручными оптимизациями, такими как раскрутка циклов или свёртка констант

Большинство проходов оптимизатора выполняется над промежуточным кодом, и делится на две категории:

 - peelhole optimizations, т.е. сканирование промежуточного кода в небольшим окном просмотра либо в пределах блока/процедуры
    - [продвижение и свёртка констант](https://ru.wikipedia.org/wiki/%D0%A1%D0%B2%D1%91%D1%80%D1%82%D0%BA%D0%B0_%D0%BA%D0%BE%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%82) (constants propagation/folding), например, `64 * 1024` превращается в `65536`
    - превращение переменных на стеке в переменные в регистре
    - устранение дублирующихся подвыражений, которые можно вычислить лишь один раз
    - арифметические трюки, например, замена перемножения целого и степени двойки на битовый сдвиг
    - удаление тупиковых записей переменных, которые потом не используются
 - control flow optimizations, т.е. изменение блоков, составляющих всевозможные пути выполнения программы
    - удаление недостижимого при выполнении кода (dead code elimination)
    - удаление дубликатов функций (common data folding)
    - вычисление инвариантов циклов и вынесение их вычисления до цикла
    - встраивание кода процедур (inlining) вместо их вызова

**Упражнение**: приведите пример написанной программистом функции, которую всегда выгоднее встраивать (inline), а не вызывать явно.

## Генерация машинного кода

В целом, промежуточный код превращается в машинный путём замены инструкций и распределения имён вычисляемых значений на регистры и на стек. Другими словами, промежуточный код &mdash; это просто универсальный ассемблер, соединяющий черты ассемблеров разных процессоров. Но на деле процессоры отличаются друг от друга:

- SSE, AVX, 3DNow! и другие подобные наборы инструкций намного эффективнее работают с векторами и матрицами, позволяя избежать последовательной покомпонентной обработки
- отдельные инструкции отвечают за операции, атомарные между ядрами процессора, идущими в обход уровней кеша оперативной памяти (на этих инструкциях реализованы атомарные переменные, мьютексы и другие примитивы)
- есть оптимизации, работающие в рамках отдельной линейки процессоров из-за особенностей их архитектуры

Большинство различий стирается с помощью intrinsic-функций (или виртуальных инструкций) в промежуточном языке. Такие инструкции разворачиваются в одну инструкцию, если целевой процессор это позволяет, но может быть заменён на целую цепочку инструкций на более ограниченных платформах.

**Упражнение**: напишите на C++ функцию, которая определяет ближайшую степень двойки, не превышающую переданное как параметр целое число. Затем найдите инструкцию ассемблера Intel x86, которая делает то же самое за один такт.

## Что надо знать до разработки бекенда

Для реализации бекенда простейшего, процедурного языка понадобится:

- Владеть паттернами проектирования: Строитель (Builder), Фасад (Facade)
- Владеть структурами данных: список, стек
- Знать детали работы языка C: что такое раздельная компиляция, статические и динамические библиотеки, соглашения о вызове (calling conventions), как через стек передаются параметры и возвращаемое значение, как работают указатели и массивы

Для реализации бекенда объектно-ориентированного языка также нужно:

- Знать детали работы языка C++: что такое раскрутка стека при выбросе исключения (stack unwinding), кодирование имён (name mangling), как устроены vtable и как реализовать полиморфизм с помощью hash-таблицы методов

## Читать далее

- [FFI - механизм интеграции между языками программирования](/compilers/backend_ffi.html)
- [Стековые и регистровые машины](/compilers/stack_and_register.html)
- [Исследуем работу компилятора C/C++](/compilers/c_in_depth.html)