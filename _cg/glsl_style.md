---
title: 'Соглашения о кодировании на GLSL'
subtitle: 'В статье описаны соглашения для языка GLSL для курса компьютерной графики 2017 года'
draft: true
---

## Форматирование кода

Правила форматирования соответствуют правилам форматирования для C++. Смотрите статью [Соглашения о кодировании на C++](cxx_style), но учтите, что clang-format не работает с языком GLSL.

Пример:

```glsl
#version 130
in vec2 aPosition;
in vec4 aTexCoord;
out vec4 vTexCoord;
uniform mat4 uProjectionMatrix;
uniform mat4 uWorldMatrix;

void main()
{
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uWorldMatrix * vec4(aPosition, 0.0, 1.0);
}
```

## Именование

Следующая таблица даст понимание стиля именования:

| Категория            | Требования                   | Пример                       |
|----------------------|------------------------------|------------------------------|
| uniform-переменные   | префикс "u" и UpperCamelCase | `uniform mat4 uWorldMatrix;` |
| атрибуты вершин      | префикс "a" и UpperCamelCase | `in vec2 aPosition;`         |
| out у vertex шейдера | префикс "v" и UpperCamelCase | `out vec4 vTexCoord;`        |
| структуры            | UpperCamelCase               | `struct LightSource`         |
| функции              | UpperCamelCase               | `IsInTriangle(...)`          |
