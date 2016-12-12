---
title: 'Загрузка 3D моделей из файла'
---

В данном примере мы создадим программный слой для загрузки элементов трёхмерных сцен из файлов в форматах различных 3D редакторов, таких как Blender или 3D Max. Мы также видоизменим загрузчик текстур, применив в нём более качественные методы интерполяции цвета текстур по поверхности.

![Скриншот](figures/lesson_20_preview.png)

## Библиотека Assimp

Существует множество форматов трёхмерных моделей, и множество библиотек для их загрузки. Мы ради универсальности будем использовать библиотеку Assimp, поддерживающую множество форматов (о распространённых форматах есть [отдельная статья](/opengl/assimp.html)).

## Результат

![Скриншот](figures/lesson_20_preview.png)

Полный код к данной статье вы можете найти [в каталоге примера в репозитории на github](https://github.com/PS-Group/cg_course_examples/tree/master/lesson_19).

## Ссылки

- [Tutorial 17 : Rotations (opengl-tutorial.org)](http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-17-quaternions/)
- [What is the correct order to multiply scale, rotation and translation matrices for a proper world matrix? (gamedev.stackexchange.com)](http://gamedev.stackexchange.com/questions/16719/)
- [Модели освещения (steps3d.narod.ru)](http://steps3d.narod.ru/tutorials/lighting-tutorial.html)
