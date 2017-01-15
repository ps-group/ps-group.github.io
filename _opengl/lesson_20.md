---
title: 'Загрузка 3D моделей из файла'
preview: figures/lesson_20_preview.png
subtitle: Геометрию и материалы сложных объектов проще загрузить из структурированного файла, чем создавать программно. Мы создадим загрузчик 3D моделей в разных форматах.
---

Цель примера — показать, как создаётся программный слой для загрузки элементов трёхмерных сцен из файлов в форматах различных 3D редакторов, таких как Blender или 3D Max. Мы также видоизменим использованный ранее загрузчик текстур, применив в нём более качественные методы интерполяции цвета текстур по поверхности.

## Библиотека Assimp

Существует множество форматов трёхмерных моделей, и множество библиотек для их загрузки. Мы ради универсальности будем использовать библиотеку Assimp, поддерживающую множество форматов (о распространённых форматах есть [отдельная статья](/opengl/assimp.html)).

## Результат

![Скриншот](figures/lesson_20_preview.png)

Полный код к данной статье вы можете найти [в каталоге примера в репозитории на github](https://github.com/PS-Group/cg_course_examples/tree/master/lesson_19). Дополнительные материалы:

- [Tutorial 17 : Rotations (opengl-tutorial.org)](http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-17-quaternions/)
- [What is the correct order to multiply scale, rotation and translation matrices for a proper world matrix? (gamedev.stackexchange.com)](http://gamedev.stackexchange.com/questions/16719/)
- [Модели освещения (steps3d.narod.ru)](http://steps3d.narod.ru/tutorials/lighting-tutorial.html)
