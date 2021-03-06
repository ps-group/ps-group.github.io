---
title: Как получить OpenGL 3.2
preview: img/help-contents.png
---

Для выполнения 3-го и 4-го разделов курса Компьютерной Графики вам потребуются относительно новые возможности OpenGL, которые опираются на стандарт OpenGL 3.2 и выше. Старые видеодрайверы и видеокарты, возможно, не обеспечивают нужную версию OpenGL, либо не поддерживают некоторые расширения.

В этой статье изложено пять разных способов обеспечить себе хорошую поддержку OpenGL. С таким обилием вариантов отговорки из разряда *"у меня не устанавливается X"* становятся просто неприличными...

## Способ первый: использовать современный драйвер

- На компьютере должен быть установлен относительно свежий видеодрайвер
- Если у вас используется гибридная графическая система видеокарта Intel + видеокарта NVIDIA, то лучше переключиться на видеокарту NVIDIA в настройках программы NVIDIA Settings, поставляемой вместе с драйвером.
- Если у вас используется гибридная графическая система видеокарта Intel + видеокарта AMD, то лучше переключиться на видеокарту AMD в настройках программы AMD Catalyst, поставляемой вместе с драйвером.

## Способ второй: установить Ubuntu

Этот способ подходит для старых компьютеров и компьютеров с единственной видеокартой от Intel. Однако, стоит помнить, что низкая производительность старых компьютеров в любом случае помешает нормальному процессу разработку.

Чтобы получить OpenGL 3.2 на любой машине, достаточно установить Ubuntu 14.04.5. Открытый видеодрайвер Mesa в этой версии предоставляет OpenGL 3.3 даже в программной реализации.

- Не стоит ставить Ubuntu на виртуальную машину: вполне возможно, что графическое оборудование станет недоступным для Ubuntu и ей придётся переключиться на программную реализацию OpenGL
- Программная реализация OpenGL (Mesa LLVMpipe) будет работать медленнее аппаратной, на сложных сценах и играх FPS может падать до 4-5 кадров в секунду. Тем не менее, вы получите OpenGL 3.3 со всеми его возможностями
- Аппаратные реализации предоставляют различные версии OpenGL в зависимости от драйвера, но в любом случае не меньше OpenGL 3.3. Открытые видеодрайверы могут работать с видеокартами основных трёх производителей: NVIDIA, AMD (ATI), Intel

## Способ третий: понизить требования к OpenGL

В примерах к этой главе стоит проверка, которая выбросит исключение в случае, если видеодрайвер не поддерживает полностью стандарт OpenGL 3.2:

```cpp
void CheckOpenglVersion()
{
    if (!GLEW_VERSION_3_2)
    {
        throw std::runtime_error("Sorry, but OpenGL 3.2 is not available");
    }
}
```

На деле, вы спокойно можете отключить эту проверку и запустить некоторые примеры даже на устаревших драйверах. Более того, поддержка шейдеров появилась в виде расширения [GL_ARB_shader_object](https://www.opengl.org/registry/specs/ARB/shader_objects.txt) ещё до появления шейдеров в стандарте OpenGL. Если ваш видеодрайвер сильно устарел и `glUseProgram` не работает, проверьте поддержку этого расширения. Если поддержка есть, замените функции для работы с шейдерами на альтернативы, описанные в спецификации расширения.

## Способ четвёртый: мобильная разработка под Android

Современные Android-устройства поддерживают стандарт OpenGL ES 2.0, во многом эквивалентный стандарту OpenGL 3.2 в режиме Compatibility Profile. Библиотеки SDL2, GLM, boost собираются и работают на Android; библиотека GLEW не нужна, т.к. нужная функциональность доступна через системные заголовочные файлы.

Таким образом, можно разрабатывать на тех же инструментах на Android NDK, или даже адаптировать для Android некоторые примеры к статьям.

## Способ пятый: звонок другу

Если ни один из перечисленных способов по каким-либо причинам недоступен, вполне возможно договориться с другом и работать за его компьютером, делая разные варианты лабораторных сначала за него, а потом за себя.

Такой способ практиковался на ПС в конце 90-х, когда доступ к компьютеру с процессором Intel и ОС Windows был далеко не у всех.
