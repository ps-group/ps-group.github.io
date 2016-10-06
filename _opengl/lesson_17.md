---
title: 'Отказ от фиксированного конвейера'
---

С приходом OpenGL 3.0 началась новая эпоха: старые способы рисования, предшествующие появлению шейдеров и массивов вершин, были объявлены устаревшими, и у программиста появилась возможность отказаться от устаревших функций ещё при создании контекста OpenGL.

В OpenGL для настольных компьютеров программисту достпен выбор между двумя профилям:

- Core Profile, в котором для рисования необходимо установить вершинный и фрагментный шейдер, а glBegin и glEnd недоступны
- Compatibility Profile, в котором работают все возможности как новых, так и старых версий OpenGL.

В OpenGL ES, который используется в мобильных устройствах, включая смартфоны и планшеты, доступен только режим Core Profile, а устаревшая функциональность не реализована в видеодрайвере.

В WebGL, который реализован современными браузерами, ради совместимости со смартфонами Compatibility Profile также недоступен.

## Включаем Core Profile

Наша задача на сегодня &mdash; взять предыдущий пример рендеринга планеты Земля и портировать его на Core Profile, заменив ранее использованную устаревшую функциональность на современные подходы.

Для начала дополним класс CWindow, обеспечив возможность выбора профиля OpenGL путём передачи в конструктор параметра. Чтобы запретить возможность использования устаревшей функциональности, потребуется:

- перед созданием контекста добавить к атрибуту SDL_GL_CONTEXT_FLAGS флаг SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG, который сообщает видеодрайверу, что приложение готово к отказу от устаревших возможностей
- установить атрибут SDL_GL_CONTEXT_PROFILE_MASK в значение SDL_GL_CONTEXT_PROFILE_CORE
- явно выбрать версию контекста OpenGL, например, 3.1 или 4.0
- запустить приложение

```cpp
// ---------  Window.h --------

enum class ContextProfile : uint8_t
{
    // Compatibility profile without exact version
    Compatibility,
    // OpenGL 3.1 with forward compatibility.
    RobustOpenGL_3_1,
    // OpenGL 3.2 with forward compatibility.
    RobustOpenGL_3_2,
    // OpenGL 4.0 with forward compatibility.
    RobustOpenGL_4_0,
};

class CWindow : private boost::noncopyable
{
public:
    CWindow(ContextProfile profile = ContextProfile::Compatibility);
    // ...
};

// --------- Window.cpp --------


CWindow::CWindow(ContextProfile profile)
    : m_pImpl(new Impl(profile))
{
}

class CWindow::Impl
{
public:
    Impl(ContextProfile profile)
        : m_profile(profile)
    {
    }

    void Show(const std::string &title, const glm::ivec2 &size)
    {
		m_size = size;

		CUtils::InitOnceSDL2();

        // Выбираем версию и параметры совместимости OpenGL.
        SetupProfileAttributes(m_profile);

        // Специальное значение SDL_WINDOWPOS_CENTERED вместо x и y заставит SDL2
        // разместить окно в центре монитора по осям x и y.
        // Для использования OpenGL вы ДОЛЖНЫ указать флаг SDL_WINDOW_OPENGL.
        m_pWindow.reset(SDL_CreateWindow(title.c_str(), SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
                                         size.x, size.y, SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE));
        if (!m_pWindow)
        {
            const std::string reason = SDL_GetError();
            throw std::runtime_error("Cannot create window: " + reason);
        }

        // Создаём контекст OpenGL, связанный с окном.
		m_pGLContext.reset(SDL_GL_CreateContext(m_pWindow.get()));
		if (!m_pGLContext)
		{
			CUtils::ValidateSDL2Errors();
		}
		CUtils::InitOnceGLEW();
    }

    // ...
};

void SetupProfileAttributes(ContextProfile profile)
{
    // Включаем режим сглаживания с помощью субпиксельного рендеринга.
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS, 1);
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 4);

    // Выбираем версию и параметры совместимости контекста
    bool makeRobust = true;
    switch (profile)
    {
    case ContextProfile::Compatibility:
        makeRobust = false;
        break;
    case ContextProfile::RobustOpenGL_3_1:
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 1);
        break;
    case ContextProfile::RobustOpenGL_3_2:
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);
        break;
    case ContextProfile::RobustOpenGL_4_0:
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
        break;
    }

    if (makeRobust)
    {
        // Отключаем поддержку старых средств из старых версий OpenGL
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_FLAGS, SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG);
    }
    else
    {
        // Включаем поддержку расширений для обратной совместимости
        // со старыми версиями OpenGL.
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_COMPATIBILITY);
    }
}
```

Теперь изменим функцию main, чтобы использовать Core Profile:

```cpp
#include "stdafx.h"
#include "WindowClient.h"
#include <SDL2/SDL.h>

int main(int, char *[])
{
    try
    {
        CWindow window(ContextProfile::RobustOpenGL_3_2);
        window.Show("Demo #17", {800, 600});
        CWindowClient client(window);
        window.DoMainLoop();
    }
    catch (const std::exception &ex)
    {
        const char *title = "Fatal Error";
        const char *message = ex.what();
        SDL_ShowSimpleMessageBox(SDL_MESSAGEBOX_ERROR, title, message, nullptr);
    }

    return 0;
}
```

После запуска после проверки кода возврата `glGetError()` будет выброшено исключение. Оно будет поймано в main, и мы получим сообщение, которое указывает, что программа применила недопустимую операцию (вызвала функцию, убранную из выбранной версии OpenGL), или передала неверный параметр:

![Скриншот](figures/invalid_operation_fatal_error.png)

## Начинаем отладку

Чтобы не гадать и не искать в документации OpenGL все возможные ошибки, мы воспользуемся возможностью отладки OpenGL с помощью расширения [GL_ARB_debug_output](https://www.opengl.org/registry/specs/ARB/debug_output.txt).

Чтобы включить этот режим, мы должны явно указать при создании контекста необходимость его отладки. Для этого добавим ещё один параметр в конструктор CWindow:

```cpp
enum class ContextMode : uint8_t
{
    // No special context settings.
    Normal,
    // Use debug context.
    Debug,
};


class CWindow : private boost::noncopyable
{
public:
    CWindow(ContextProfile profile = ContextProfile::Compatibility,
            ContextMode mode = ContextMode::Normal);
    // ...
};

// ... передаём ContextMode в Impl и сохраняем в поле ...
// ... также изменим функцию SetupProfileAttributes ...

void SetupProfileAttributes(ContextProfile profile, ContextMode mode)
{
    // Включаем режим сглаживания с помощью субпиксельного рендеринга.
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS, 1);
    SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 4);

    // Выбираем версию и параметры совместимости контекста
    bool makeRobust = true;
    switch (profile)
    {
    case ContextProfile::Compatibility:
        makeRobust = false;
        break;
    case ContextProfile::RobustOpenGL_3_1:
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 1);
        break;
    case ContextProfile::RobustOpenGL_3_2:
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);
        break;
    case ContextProfile::RobustOpenGL_4_0:
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
        break;
    }

    unsigned flags = 0;
    if (mode == ContextMode::Debug)
    {
        // Включаем поддержку отладочных средств
        //  в создаваемом контексте OpenGL.
        flags |= SDL_GL_CONTEXT_DEBUG_FLAG;
    }
    if (makeRobust)
    {
        // Отключаем поддержку старых средств из старых версий OpenGL
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
        flags |= SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG;
    }
    else
    {
        // Включаем поддержку расширений для обратной совместимости
        // со старыми версиями OpenGL.
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_COMPATIBILITY);
    }
}
```

Теперь в конце метода Show мы можем добавить вызов вспомогательной функции, которая с помощью функций [glDebugMessageCallback](https://www.opengl.org/sdk/docs/man/html/glDebugMessageCallback.xhtml) и [glDebugMessageControl](https://www.opengl.org/sdk/docs/man/html/glDebugMessageControl.xhtml) настроит обработку сообщений об ошибке, созданных видеодрайвером.

```

void CWindow::Impl::Show(const std::string &title, const glm::ivec2 &size)
{
    // ...

    // Устанавливаем функцию обработки отладочных сообщений.
    if (m_contextMode == ContextMode::Debug)
    {
        SetupDebugOutputCallback();
    }
}

void DebugOutputCallback(GLenum /*source*/,
                         GLenum type,
                         GLuint id,
                         GLenum /*severity*/,
                         GLsizei /*length*/,
                         const GLchar* message,
                         const void* /*userParam*/)
{
    // Отсекаем все сообщения, кроме ошибок
    if (type != GL_DEBUG_TYPE_ERROR)
    {
        return;
    }
    std::string formatted = "OpenGL error #" + std::to_string(id) + ": " + message;
    std::cerr << formatted << std::endl;
}

void SetupDebugOutputCallback()
{
    if (!GLEW_ARB_debug_output)
    {
        throw std::runtime_error("Cannot use debug output:"
                                 " it isn't supported by videodriver");
    }

    glEnable(GL_DEBUG_OUTPUT);

    // Синхронный режим позволяет узнать в отладчике контекст,
    //  в котором произошла ошибка.
    // Режим может понизить производительность, но на фоне
    //  других потерь Debug-сборки это несущественно.
    glEnable(GL_DEBUG_OUTPUT_SYNCHRONOUS);

    glDebugMessageCallback(DebugOutputCallback, nullptr);
    // Указываем видеодрайверу выдать только один тип сообщений,
    //  GL_DEBUG_TYPE_ERROR.
    glDebugMessageControl(GL_DONT_CARE, GL_DEBUG_TYPE_ERROR, GL_DONT_CARE, 0, nullptr, GL_TRUE);
}
```

И теперь, после установки точки останова (*англ.* breakpoint) внутри DebugOutputCallback мы после запуска на отладку получим отличный стек вызовов (*англ.* stacktrace) непосредственно в момент ошибки!

![Скриншот](figures/opengl_error_stacktrace.png)

## Избавляемся от матриц GL_MODELVIEW и GL_PROJECT

Из скриншота выше и документации OpenGL несложно сделать вывод, что функции `glLoadMatrix*`, `glMatrixMode` и другие недоступны в современном OpenGL в режиме Core Profile.

Теперь программист обязан самостоятельно передавать эти матрицы через uniform-переменные, или же не передавать, если они ему не нужны в условиях решаемой задачи. Что касается производителей видеокарт, то для них отказ от матриц в глобальном состоянии OpenGL позволяет улучшить параллелизм графического конвейера.

## Результат

После запуска получим изображение, где дневная сторона Земли плавно переходит в ночную, на которой горит множество огней больших городов.

![Скриншот](figures/lesson_16_preview.png)

Полный код к данной статье вы можете найти [в каталоге примера в репозитории на github](https://github.com/PS-Group/cg_course_examples/tree/master/lesson_16).
