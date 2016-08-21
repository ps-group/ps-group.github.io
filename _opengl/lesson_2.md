---
title: Изучаем возможности OpenGL
---

В данном уроке мы немного разберёмся в структуре API современного OpenGL. Также мы подключим библиотеку GLEW и научимся определять возможности видеодрайвера, на котором запущено приложение.

## Структура API OpenGL

API OpenGL описан на языке C без применения C++ ради простоты и платформонезависимости. Он состоит только из функций, констант и примитивных типов, объявленных через `typedef`, таких как `"typedef int GLenum;"`.

Функции делятся на две группы:

- команды (*англ.* commands) для изменения состояния драйвера
- запросы (*англ.* queries) состояния драйвера

Вот несколько примеров:

- функция-команда `void glClearColor(GLclampf red, GLclampf green, GLclampf blue, GLclampf alpha)` устанавливает цвет очистки; RGBA компоненты цвета передаются как число с плавающей точкой на отрезке `[0..1]`.
- функция-команда `void glClear()` очищает буфер кадра путём заливки пикселей цветом очистки.
- функция-запрос `const GLubyte *glGetString(GLenum name)` возвращает строковое значение некоторой константы или величины в видеодрайвере, выбор величины зависит от параметра `name`; при этом `const GLubyte*` можно преобразовать в `const char*` с помощью `reinterpret_cast`.
- тип данных `GLclampf` означает "число с плавающей точкой на отрезке `[0..1]`"; при этом никаких проверок принадлежности диапазону компилятор делать не будет, потому что тип объявлен просто как `typedef float GLclampf`.

Функции-команды ничего не возвращают, даже статуса своего выполнения. Это даёт возможность выполнить команду асинхронно, не заставляя приложение ждать, пока видеодрайвер отправит данные на видеокарту и получит от неё ответ.

## Обработка ошибок

OpenGL старательно обрабатывает ошибки, такие как "недопустимый аргумент", "неправильная константа enum", "несвоевременный вызов команды". Узнать о наличии общей ошибки в одной из предыдущих функций-команд можно функцией-запросом `GLenum glGetError()`.

- Если функция возвращает `GL_NO_ERROR`, ошибок не было
- В противном случае код ошибки обозначает категорию ошибки без конкретных указаний
- Функция не только возвращает код ошибки, но и очищает флаг ошибки в драйвере; при этом за один вызов может быть очищен флаг только для одной категории ошибок, поэтому `glGetError` следует вызывать в цикле, пока он не вернёт `GL_NO_ERROR`

Условно, код может выглядеть так:
```cpp
void DumpGLErrors()
{
    for (GLenum error = glGetError(); error != GL_NO_ERROR; error = glGetError())
    {
        std::string message;
        // с помощью switch превращаем GLenum в строковое описание
        // печатаем строку или делаем ещё что-то в целях отладки 
    }
}
```

Функцию можно улучшить, если учесть следующее:
- Распечатать строку ошибки можно в поток ошибок `std::cerr`
- В UNIX-системах любое графическое приложение может быть запущено из консоли, что позволит увидеть его поток ошибок при запуске как в IDE, так и вручную
- В Windows графические приложения не связываются с окном консоли, но можно вставит специальную инструкцию `__debugbreak();`, которая вызовет останов в отладочной конфигурации, запущенной под отладчиком (так же, как обычный breakpoint).

#### Листинг DumpGLErrors

```cpp
void DumpGLErrors()
{
    for (GLenum error = glGetError(); error != GL_NO_ERROR; error = glGetError())
    {
        std::string message;
        switch (error)
        {
        case GL_INVALID_ENUM:
            message = "invalid enum passed to GL function (GL_INVALID_ENUM)";
            break;
        case GL_INVALID_VALUE:
            message = "invalid parameter passed to GL function (GL_INVALID_VALUE)";
            break;
        case GL_INVALID_OPERATION:
            message = "cannot execute some of GL functions in current state (GL_INVALID_OPERATION)";
            break;
        case GL_STACK_OVERFLOW:
            message = "matrix stack overflow occured inside GL (GL_STACK_OVERFLOW)";
            break;
        case GL_STACK_UNDERFLOW:
            message = "matrix stack underflow occured inside GL (GL_STACK_UNDERFLOW)";
            break;
        case GL_OUT_OF_MEMORY:
            message = "no enough memory to execute GL function (GL_OUT_OF_MEMORY)";
            break;
        default:
            message = "error in some GL extension (framebuffers, shaders, etc)";
            break;
        }
        std::cerr << "OpenGL error: " << message << std::endl;
#ifdef _WIN32
        __debugbreak();
#endif
    }
}
```

После добавления этого метода в `CAbstractWindow::Impl` можно улучшить основной цикл приложения:

```cpp
// Очистка буфера кадра, обновление и рисование сцены, вывод буфера кадра.
if (running)
{
    m_pImpl->Clear();
    const float deltaSeconds = chronometer.GrabDeltaTime();
    OnUpdateWindow(deltaSeconds);
    OnDrawWindow(m_pImpl->GetWindowSize());
    m_pImpl->DumpGLErrors();
    m_pImpl->SwapBuffers();
}
```

## Расширения OpenGL

В целях максимальной гибкости, все изменения в OpenGL вносятся в виде расширений. Расширение OpenGL &mdash; это задокументированная спецификация, который описывает новые функции и их поведение, изменения в поведении старых функций и новые константы. Каждое расширение имеет имя, например, `"GL_ARB_multitexture"`. При выпуске новой версии OpenGL часть расширений попадает в новую версию и становится частью ядра OpenGL. Таким образом, в версии OpenGL 3.0 и выше вы автоматически получаете ряд возможностей, которые в OpenGL 1.2 были доступны только как расширения.

- В UNIX-системах и на мобильных устройствах доступны достаточно свежие версии OpenGL (обычно 3.0 и выше), где многие важные расширения уже стали частью ядра стандарта.
- В Windows версии старше OpenGL 1.1 напрямую недоступны, но разработчики драйверов дают доступ к ним через механизм расширений. Если видеодрайвер не установлен, будет доступен только OpenGL 1.1, обладающий весьма ограниченными возможностями.

Функция, описанная в расширении, может не существовать в конкретной реализации OpenGL (если она не поддерживает данное расширение). Поэтому программист должен 

- либо запросить адрес функции и использовать её, только если адрес ненулевой
- либо проверить наличие поддержки расширения по его имени и потом смело запрашивать адреса описанных в расширении функций

В стандарте OpenGL не описан способ получения адреса, и каждая операционная система или мультимедийная библиотека предоставляет свой способ. В SDL2 есть функция `void *SDL_GL_GetProcAddress(const char *proc)`, которая по имени OpenGL-функции возвращает её адрес или `nullptr`, если функция недоступна.

## Получение информации о версии OpenGL

Один и тот же видеодрайвер может создать разные констексты с разными версиями OpenGL и разными наборами расширений. Поэтому получать версионную информацию следует уже после создания контекста.

Для получения информации мы применим функцию-запрос `glGetString` с тремя различными параметрами. На эту тему есть статья [Get Context Info (opengl.org)](https://www.opengl.org/wiki/Get_Context_Info).

- константа с именем GL_VERSION возвращает строку версии OpenGL, причём в начале строки обязательно стоит `"<номер мажорной версии>.<номер минорной версии> "`, а остальная часть строки не определена. Например, строка `"3.0 Mesa 10.3.2"` обозрачает "OpenGL версии 3.0, реализуемый подсистемой графики Mesa версии 10.3.2".
- константа с именем GL_VENDOR возвращает имя поставщика реализации OpenGL. Например, строка `"Intel Open Source Technology Center"` обозначает "Видеодрайвер предоставлен OpenSource-подразделением корпорации Intel".
- константа с именем GL_EXTENSIONS содержит полный список расширений, разделённый пробелами. Список обычно насчитывает свыше ста расширений.

#### Функция печати информации о контексте
```cpp
void PrintOpenGLInfo()
{
    std::string version = reinterpret_cast<const char *>(glGetString(GL_VERSION));
    std::string vendorInfo = reinterpret_cast<const char *>(glGetString(GL_VENDOR));
    std::string extensionsInfo = reinterpret_cast<const char *>(glGetString(GL_EXTENSIONS));
    std::cerr << "OpenGL version: " << version << std::endl;
    std::cerr << "OpenGL vendor: " << vendorInfo << std::endl;
    std::cerr << "Full OpenGL extensions list: " << extensionsInfo << std::endl;
}
```

Следуя "правилу трёх ударов", можно отрефакторить этот код:

```cpp
void PrintOpenGLInfo()
{
    auto printOpenGLString = [](const char *description, GLenum name) {
        std::string info = reinterpret_cast<const char *>(glGetString(name));
        std::cerr << description << info << std::endl;
    };
    printOpenGLString("OpenGL version: ", GL_VERSION);
    printOpenGLString("OpenGL vendor: ", GL_VENDOR);
    printOpenGLString("Full OpenGL extensions list: ", GL_EXTENSIONS);
}
```

## Библиотека GLEW

- Сайт проекта: http://glew.sourceforge.net/
- В Debian/Ubuntu доступна в пакете `libglew-dev`

Запрашивать функции и проверять расширения вручную не всегда удобно. Для решения этой типовой задачи создана библиотека `GLEW` (сокращение от "openGL Extensions Wrapper"). С помощью макросов и отложенной загрузки адресов функций эта библиотека позволяет использовать расширения так, как будто бы никаких расширений не существует:

- вы просто вызываете функции по имени; если функции нет, произойдёт разыменование нулевого указания
- также вы можете использовать модифицированное имя расширения (с префиксом "GLEW_" вместо "GL_") как целочисленную переменную со значением 0 или 1; 1 означет, что расширение есть и доступно, 0 означает, что расширения нет или оно недоступно
- если расширение недоступно, вы не должны вызывать функции расширения, чтобы не получить разыменование нулевого указателя
- если при создании контекста OpenGL вы потребовали и получили контекст не ниже определённой версии, то можно даже не проверять расширения, вошедшие в эту версию: они есть.

Подключать заголовок `glew.h` следует до первого включения `gl.h`, иначе вы получите ошибку при компиляции.

```cpp
// Правильно
#include <GL/glew.h>
#include <GL/gl.h>

// Неправильно!
#include <GL/gl.h>
#include <GL/glew.h>
```

Библиотека GLEW требует явного вызова функции glewInit для своей инициализации. Сделать вызов следует только один раз. Чтобы не накладывать на класс `CAbstractWindow` лишних ограничений, нужно гарантировать, что при первом конструировании объекта `CAbstractWindow` функция будет вызвана, а при последующих &mdash; уже нет. Также надо установить глобальную переменную-флаг `glewExperimental`, чтобы GLEW оборачивала функции из версий OpenGL 3.x и 4.x.

Для этой цели можно использовать стандартный заголовок `<mutex>` и описанную в нём функцию [std::call_once](http://en.cppreference.com/w/cpp/thread/call_once).

```cpp
class CAbstractWindow::Impl
{
public:
    Impl()
        : m_pWindow(nullptr, SDL_DestroyWindow)
        , m_pGLContext(nullptr, SDL_GL_DeleteContext)
    {
    }
    void ShowFixedSize(glm::ivec2 const& size)
    {
        m_size = size;
        // Создаём окно
        // Создаём контекст OpenGL, связанный с окном.
        // Затем инициализируем GLEW
        InitGlewOnce();
    }
    
    void InitGlewOnce()
    {
        // Вызываем инициализацию GLEW только один раз за время работы приложения.
        std::call_once(g_glewInitOnceFlag, []() {
            glewExperimental = GL_TRUE;
            if (GLEW_OK != glewInit())
            {
                std::cerr << "GLEW initialization failed, aborting." << std::endl;
                std::abort();s
            }
        });
    }
}
```

### Узнаём о расширениях через GLEW

Читать полный список расширений, полученный через `glGetString(GL_EXTENSIONS)`, не очень удобно. Сканировать его программно слишком трудоёмко в плане вычислений.

Для удобного получения расширений у GLEW есть переменные-флаги, которые устанавливаются при вызове `glewInit()`. Для проверки наличия расширения надо:

- найти идентификатор расширения в [реестре расширений (opengl.org)](https://www.opengl.org/registry/), например, `GL_ARB_vertex_shader`
- заменить префикс `GL_` на `GLEW_`
- написать проверку переменной-флага с таким именем

Теперь можно улучшить функцию `PrintOpenGLInfo`:

```cpp
void PrintOpenGLInfo()
{
    auto printOpenGLString = [](const char *description, GLenum name) {
        std::string info = reinterpret_cast<const char *>(glGetString(name));
        std::cerr << description << info << std::endl;
    };
    printOpenGLString("OpenGL version: ", GL_VERSION);
    printOpenGLString("OpenGL vendor: ", GL_VENDOR);

    if (GLEW_ARB_vertex_shader)
    {
        std::cerr << "Has vertex shaders" << std::endl;
    }
    else
    {
        std::cerr << "Has no vertex shaders" << std::endl;
    }
    if (GLEW_ARB_fragment_shader)
    {
        std::cerr << "Has fragment shaders" << std::endl;
    }
    else
    {
        std::cerr << "Has no fragment shaders" << std::endl;
    }
    if (GLEW_ARB_vertex_buffer_object)
    {
        std::cerr << "Has vertex buffers" << std::endl;
    }
    else
    {
        std::cerr << "Has vertex busffers" << std::endl;
    }
    if (GLEW_ARB_framebuffer_object)
    {
        std::cerr << "Has framebuffers" << std::endl;
    }
    else
    {
        std::cerr << "Has framebuffers" << std::endl;
    }
}
```

Рефакторим код:
```cpp
void PrintOpenGLInfo()
{
    auto printOpenGLString = [](const char *description, GLenum name) {
        std::string info = reinterpret_cast<const char *>(glGetString(name));
        std::cerr << description << info << std::endl;
    };
    printOpenGLString("OpenGL version: ", GL_VERSION);
    printOpenGLString("OpenGL vendor: ", GL_VENDOR);

    auto testExtension = [](const char *description, GLboolean supportFlag) {
        const char *prefix = supportFlag ? "Has " : "Has no ";
        std::cerr << prefix << description << std::endl;
    };
    testExtension("vertex shaders", GLEW_ARB_vertex_shader);
    testExtension("fragment shaders", GLEW_ARB_fragment_shader);
    testExtension("vertex buffers", GLEW_ARB_vertex_buffer_object);
    testExtension("framebuffers", GLEW_ARB_framebuffer_object);
}
```

На машине с Ubuntu 14.04 и встроенной видеокартой Intel программа выводит следующее:

```
OpenGL version: 3.0 Mesa 10.3.2
OpenGL vendor: Intel Open Source Technology Center
Has vertex shaders
Has fragment shaders
Has vertex buffers
Has framebuffers
```

### Соединяем вместе

Новый код для мониторинга ошибок и инициализации GLEW следует поместить в базовый класс `CAbstractWindow`, он понадобится в дальнейшем.

Код запроса версии OpenGL разместим в классе `CWindow`, потому что в дальнейших примерах нам уже не нужно будет печатать что-либо в консоль.

#### листинг Window.h

```cpp
#pragma once
#include "AbstractWindow.h"

class CWindow : public CAbstractWindow
{
    // CAbstractWindow interface
protected:
    void OnWindowEvent(const SDL_Event &event) override;
    void OnUpdateWindow(float deltaSeconds) override;
    void OnDrawWindow(const glm::ivec2 &size) override;

private:
    void PrintOpenGLInfo();
};
```

#### листинг Window.cpp

```cpp
#include "Window.h"
#include <mutex>
#include <iostream>
#include <vector>
#include <algorithm>
#include <cctype>
#include <boost/algorithm/string/replace.hpp>
#include <boost/algorithm/string/split.hpp>
#include <boost/algorithm/string/join.hpp>
#include <boost/algorithm/string/predicate.hpp>
#include <boost/algorithm/string/classification.hpp>
#include <GL/glew.h>
#include <GL/gl.h>

namespace
{
std::once_flag g_didPrintOpenGLInfo;
}

void CWindow::OnWindowEvent(const SDL_Event &event)
{
    (void)event;
}

void CWindow::OnUpdateWindow(float deltaSeconds)
{
    (void)deltaSeconds;
}

void CWindow::OnDrawWindow(const glm::ivec2 &size)
{
    (void)size;
    std::call_once(g_didPrintOpenGLInfo, &CWindow::PrintOpenGLInfo, this);
}

void CWindow::PrintOpenGLInfo()
{
    auto printOpenGLString = [](const char *description, GLenum name) {
        std::string info = reinterpret_cast<const char *>(glGetString(name));
        std::cerr << description << info << std::endl;
    };
    printOpenGLString("OpenGL version: ", GL_VERSION);
    printOpenGLString("OpenGL vendor: ", GL_VENDOR);

    auto testExtension = [](const char *description, GLboolean supportFlag) {
        const char *prefix = supportFlag ? "Has " : "Has no ";
        std::cerr << prefix << description << std::endl;
    };
    testExtension("vertex shaders", GLEW_ARB_vertex_shader);
    testExtension("fragment shaders", GLEW_ARB_fragment_shader);
    testExtension("vertex buffers", GLEW_ARB_vertex_buffer_object);
    testExtension("framebuffers", GLEW_ARB_framebuffer_object);
}
```

