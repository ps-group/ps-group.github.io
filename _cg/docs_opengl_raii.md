---
title: 'RAII для OpenGL'
---

Модуль `libplatform/OpenGL.h` предоставляет продвинутые функции, абстрагирующие создание и удаление ресурсов OpenGL. Он выполняет две задачи:

- автоматическое удаление ресурса при выходе из области видимости переменной, хранящей ссылку на ресурс
- выброс исключения при ошибке создания ресурса (например, при ошибке компиляции шейдера)

## Типы ресурсов OpenGL

OpenGL спроектирован для видеокарт. Видеокарта часто имеет выделенную оперативную память, собственные узкоспециализированные процессоры и управляется командами видеодрайвера. Видеодрайвер исполняется на центральном процессоре и является частью ОС.

Отсюда логичное следствие: графические ресурсы оптимальнее хранить в видеопамяти, а не в основной оперативной памяти. Для базовой работы с OpenGL достаточно следующих типов ресурсов:

| Ресурс              | Функция создания  | Функция удаления     |
|---------------------|-------------------|----------------------|
| VBO                 | glGenBuffers      | glDeleteBuffers      |
| VAO                 | glGenVertexArrays | glDeleteVertexArrays |
| Шейдер              | glCreateShader    | glDeleteProgram      |
| Шейдерная программа | glCreateProgram   | glDeleteProgram      |
| Текстура            | glGenTextures     | glDeleteTextures     |

- VBO — это буфер данных, именно в него записываются данные вершин графических примитивов
- VAO — это контекст привязки буферов и смещений внутри interleaved arrays буфера к входным переменным шейдерной программы; активируя другой VAO, мы меняем текущий набор привязок атрибутов и буферв
- Шейдер и шейдерная программа — это мини-программы на языке GLSL, компилируемые видеодайвером и исполняемые на видеокарте; шейдеры дают программисту возможность управления конвейером рисования
- Текстура — это распакованное изображение, загруженное в память видеокарты; пиксели текстуры обычно называются текселями (texels)

## Класс ps::detail::GfxObject

Удаление объектов OpenGL вручную — неблагодарный труд. Для автоматического удаления мы создадим шаблонный класс, работающий подобно умному указателю `unique_ptr`. Использовать `unique_ptr` мы не можем, поскольку все идентификаторы объектов OpenGL — это просто `unsigned` числа. Данный класс будет параметризован одной из функций, выполняющих удаление объектов разных категорий:

```cpp
namespace ps::detail
{
using DeleteFn = void(gl::GLuint handle) noexcept;

void DeleteShader(gl::GLuint handle) noexcept;
void DeleteProgram(gl::GLuint handle) noexcept;
void DeleteVBO(gl::GLuint handle) noexcept;
void DeleteVAO(gl::GLuint handle) noexcept;
}
```

Реализация класса похожа на реализацию любого другого RAII в языке C++: мы запрещаем копирование объекта, определяем способ перемещения и удаляем ресурс в деструкторе. Для доступа к ресурсу служит метод `get()`. Перегружать операторы разыменования не нужно, т.к. GfxObject хранит просто целое число.

```cpp
template<DeleteFn deleteFn>
class GfxObject
{
public:
    // Копирование объекта запрещено (можно только переместить).
    GfxObject(const GfxObject& other) = delete;
    GfxObject& operator=(const GfxObject& other) = delete;

    // По умолчанию конструируется с нулевым объектом
    GfxObject() = default;

    // Можно конструировать из числового идентификатора объекта OpenGL
    explicit GfxObject(gl::GLuint handle)
        : m_handle(handle)
    {
    }

    // Можно переместить объект (согласно move-семантике)
    GfxObject(GfxObject&& other) noexcept
    {
        std::swap(m_handle, other.m_handle);
    }

    // Можно переместить объект (согласно move-семантике)
    GfxObject& operator=(GfxObject&& other) noexcept
    {
        reset();
        std::swap(m_handle, other.m_handle);
        return *this;
    }

    // При уничтожении хранимый объект также удаляется
    ~GfxObject()
    {
        reset();
    }

    // reset удаляет хранимый объект, если он есть.
    void reset() noexcept
    {
        if (m_handle != 0)
        {
            deleteFn(m_handle);
            m_handle = 0;
        }
    }

    // get даёт доступ к числовому идентификатору объекта OpenGL
    gl::GLuint get() const noexcept
    {
        return m_handle;
    }

    // при приведении к типу bool происходит проверка - хранится ли объект?
    explicit operator bool() const noexcept
    {
        return (m_handle != 0);
    }

private:
    gl::GLuint m_handle = 0;
};
```

## Функции для создания VAO и VBO

Используя специализации GfxObject, мы можем создать серию функций, возвращающих умный RAII-объект вместо простого числа. Это гарантирует корректное удаление ресурса OpenGL после потери последней ссылки на него.

```cpp
// Фасад функции glGenVertexArrays
// Создаёт VAO, хранящий связь буферов данных и атрибутов вершин.
VertexArrayObject CreateVAO()
{
    GLuint handle;
    glGenVertexArrays(1, &handle);
    return VertexArrayObject(handle);
}

// Фасад функций glGenBuffers и glBufferData
// Передаёт на видеокарту заданные байты
// @param target - это GL_ARRAY_BUFFER, GL_ELEMENT_ARRAY_BUFFER или GL_UNIFORM_BUFFER
VertexBufferObject CreateStaticVBO(gl::GLenum target, const std::byte* bytes, const size_t byteCount)
{
    GLuint handle;
    glGenBuffers(1, &handle);
    glBindBuffer(target, handle);
    glBufferData(target, byteCount, bytes, GL_STATIC_DRAW);

    return VertexBufferObject(handle);
}
```

Функция CreateStaticVBO имеет узкое предназначение: она создаёт буфер, который содержит неизменный набор данных о вершинах. Неизменность буфера позволяет указать подскзку `GL_STATIC_DRAW` к вызову `glBufferData`. Эта подсказка поможет видеодрайверу подобрать оптимальное расположение буфера в видеопамяти: чем реже меняются данные, тем дальше от центрального процессора их можно поместить.

Функция CreateStaticVAO создаёт ресурс Vertex Array Object.

## Компиляция шейдеров

Программист пишет шейдеры на GLSL и оставляет их виде исходного кода; компиляцией шейдера в ассемблер процессора видеокарты будет заниматься видеодрайвер. В процессе сборки графической программы исходный код шейдеров передаётся из памяти программы компилятору в составе видеодрайвера, там собирается и превращается в ресурс типа `unsigned`, представляющий программу на стороне видеокарты:

![Схема](img/glsl/shader_program_overview.png)

Для управления процессом компиляции существует целый набор функций в API OpenGL. На схеме ниже показана последовательность вызова функций-команд OpenGL без учёта обработки ошибок:

![Схема](img/glsl/shader_build_calls.png)

Теперь можно представить функции `CompileShader`, `LinkProgram` и `ValidateProgram`. Первые две проверяют ошибку на соответствующем шаге сборки, и в случае ошибки получают от GLSL-подсистемы видеодрайвера лог компиляции/компоновки и добавляют его к тексту исключения.

Функция `ValidateProgram` может выдать лог с несущественными проблемами, с которыми программа может продолжать корректно работать. Данная функция предназначена для отладочных целей и выводит лог видеодрайвера в указанный поток (например, в `std::cerr`).

```cpp
namespace detail
{
void DeleteShader(gl::GLuint handle) noexcept
{
    glDeleteShader(handle);
}

void DeleteProgram(gl::GLuint handle) noexcept
{
    glDeleteProgram(handle);
}
}

using ShaderObject = detail::GfxObject<detail::DeleteShader>;
using ProgramObject = detail::GfxObject<detail::DeleteProgram>;

// Фасад функции glCompileShader
// Компилирует шейдер заданного типа из строки с исходным кодом
// @param type - это GL_VERTEX_SHADER, GL_FRAGMENT_SHADER или GL_GEOMETRY_SHADER.
ShaderObject CompileShader(gl::GLenum type, std::string_view source)
{
	// Выделяем ресурс шейдера
	ShaderObject obj = ShaderObject(glCreateShader(type));

	// Передаём исходный код шейдера видеодрайверу
	const auto length = static_cast<int>(source.length());
	const char* sourceLine = source.data();
	glShaderSource(obj.get(), 1, (const GLchar**)&sourceLine, &length);

	// Просим видеодрайвер скомпилировать шейдер и проверяем статус
	glCompileShader(obj.get());
	CheckShaderCompilatioStatus(obj.get());

	return obj;
}

// Фасад функции glLinkProgram
// Выполняет компоновку шейдеров в единую программу
ProgramObject LinkProgram(const std::vector<ShaderObject>& shaders)
{
	// Запрашиваем у видеодрайера новый объект.
	ProgramObject obj = ProgramObject(glCreateProgram());

	// Прикрепляем ранее скомпилированные шейдеры.
	for (const ShaderObject& shader : shaders)
	{
		glAttachShader(obj.get(), shader.get());
	}

	// Просим видеодрайвер выполнить компоновку и проверяем статус.
	glLinkProgram(obj.get());
	CheckProgramLinkingStatus(obj.get());

	// Отсоединяем шейдеры, поскольку программа уже собрана.
	for (const ShaderObject& shader : shaders)
	{
		glDetachShader(obj.get(), shader.get());
	}

	return obj;
}

// Фасад функции glValidateProgram
// Валидация - необязательный этап, который может сообщить
// о проблемах производительности или предупреждениях компилятора GLSL
// Если проблемы есть, они выводятся в поток out.
void ValidateProgram(const ProgramObject& program, std::ostream& out)
{
	glValidateProgram(program.get());

	GLboolean status = 0;
	glGetProgramiv(program.get(), GL_VALIDATE_STATUS, &status);
	if (status == GL_FALSE)
	{
		// Записываем лог валидации в поток
		const string log = ReadProgramInfoLog(program.get());
		out << log;
	}
}
```