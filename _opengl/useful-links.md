---
title: 'Дополнительные материалы'
---

## Инструкции по настройке библиотек

- [инструкция по установке SDL2 (learnathing.weebly.com)](http://learnathing.weebly.com/part-1-prerequisites.html)
- [инструкция по настройке проекта с GLEW в Visual Studio](http://sites.fas.harvard.edu/~lib175/pages/visstudio.html)

## Документация библиотек

Копии оффлайн документации для библиотек Box2D, DevIL, FreeImage, GLU, OpenAL есть в [репозитории с примерами кода на github](https://github.com/PS-Group/cg_course_examples/tree/master/documentation).

Документация, доступная онлайн:

- [Предметный указатель для SDL2 (wiki.libsdl.org)](http://wiki.libsdl.org/APIByCategory)
- [Предметный указатель для GLM 0.9.7 (glm.g-truc.net)](http://glm.g-truc.net/0.9.7/api/modules.html)
- [Предметный указатель для OpenGL 2.1 (opengl.org)](https://www.opengl.org/sdk/docs/man2/)
- [Предметный указатель для OpenGL 4.x (opengl.org)](https://www.opengl.org/sdk/docs/man4/)

## Вывод текста в OpenGL

В рамках OpenGL 1.x текст чаще всего выводят как текстуру, либо цельной строкой, либо глифами (glyph - это форма отдельной буквы). Также в Windows есть API, позволяющий сформировать Display List с глифами букв.

- [растеризация текста с помощью TrueType-шрифта средствами библиотеки SDL_ttf v2 (willusher.io)](http://www.willusher.io/sdl2%20tutorials/2013/12/18/lesson-6-true-type-fonts-with-sdl_ttf)
- [растеризация текста с помощью TrueType-шрифта средствами библиотеки FreeType (nehe.gamedev.net)](http://nehe.gamedev.net/tutorial/freetype_fonts_in_opengl/24001/)
- [растеризация текста на Windows с помощью wglUseFontOutlines (nehe.gamedev.net)](http://nehe.gamedev.net/tutorial/outline_fonts/15004/)

## Камера и трансформации

- [подробная статья с реализациями разных типов камеры на C++ и glm (learnopengl.com)](http://learnopengl.com/#!Getting-started/Camera)

## Спецэффекты на шейдерах

- [эффект глубины резкости, Depth of Field (en.wikibooks.org)](https://en.wikibooks.org/wiki/OpenGL_Programming/Depth_of_Field)
- [размытие при движении, Motion Blur (en.wikibooks.org)](https://en.wikibooks.org/wiki/OpenGL_Programming/Motion_Blur)
- [эффект дырявого тела с помощью оператора discard в GLSL (opengl.org)](https://www.opengl.org/sdk/docs/tutorials/ClockworkCoders/discard.php)

## Книги

#### Викикнига "OpenGL Programming"

- [индексная страница (en.wikibooks.org)](https://en.wikibooks.org/wiki/OpenGL_Programming)

#### Френсис Хилл, "OpenGL. Программирование компьютерной графики."

ISBN 5-318-00219-6. Полезные главы:

- В главе 4 "Векторные инструменты для графики" рассказано о базовых свойствах алгебры векторов. В разделе 4.7 показано, как найти пересечение луча с плоскостью
- В разделе 6.3 "Многогранники" показаны способы разделить правильные и полуправильные многогранники на сетку треугольников.
- В разделе 6.5 "Каркасные аппроксимации гладких объектов" показан [метод UV-параметризации](https://en.wikipedia.org/wiki/Parametric_surface), который позволяет создать сетку треугольников с привязанными к ней текстурными координатами для тел вращения.
- В разделе 7.3 "Встраивание камеры в программу" показано, как реализовать камеру для летящего тела, подобного самолёту, имеющего крен, [тангаж](https://ru.wikipedia.org/wiki/%D0%A2%D0%B0%D0%BD%D0%B3%D0%B0%D0%B6) и [рысканье](https://ru.wikipedia.org/wiki/%D0%A0%D1%8B%D1%81%D0%BA%D0%B0%D0%BD%D0%B8%D0%B5).
- В главе 14 "Введение в трассировку лучей" показан ряд приёмов, необходимых при написании трассировщика лучей

