---
title: 'Класс math::Transform2D'
draft: true
---

Класс `math::Transform2D` находится в `libmath` и представляет аффинную трансформацию, состоящую из масштабирования, ориентирующего поворота и перемещения объекта.

## Определение класса

В динамичной программе матрица трансформации объекта меняется на каждом кадре. Если вы храните матрицу, то будет трудно изменить отдельный компонент, не затронув остальные. Например, если матрица содержит translate, то любой rotate будет выполняться относительно начала координат, а не центра фигуры.

Удобнее хранить и изменять исходные компоненты трансформации. Обычно хватает трёх компонентов:

- масштабирующий scale
- ориентирующий rotate
- задающий позицию translate

```cpp
#pragma once
#include <glm/fwd.hpp>
#include <glm/vec2.hpp>

namespace math
{
// Преобразует координаты из локальных в мировые в следующем порядке:
//  - сначала вершины масштабируются
//    например, единичный круг может превратиться в эллипс
//  - затем поворачиваются
//    т.е. фигуры ориентируются на плоскости
//  - затем переносятся
//    т.е. задаётся положение тела
// изменив порядок, мы изменили бы значение трансформаций.
struct Transform2D
{
public:
	// Позиция фигуры относительно центра мира.
	glm::vec2 position{ 0, 0 };
	// Угол собственного поворота фигуры в радианах.
	float orientation{ 0 };
	// Множители размера фигуры по двум осям.
	glm::vec2 size{ 1, 1 };

	void RotateBy(float radians);
	void ScaleBy(const glm::vec2& scale);
	void ScaleBy(const float scale);
	void MoveBy(const glm::vec2& distance);

	glm::mat3 ToMat3() const;
	glm::mat4 ToMat4() const;
};
}
```

## Реализация

Реализовать изменение трансформации очень просто:

```cpp
void Transform2D::RotateBy(float radians)
{
	this->orientation += radians;
}

void Transform2D::ScaleBy(const glm::vec2& scale)
{
	this->size += size;
}

void Transform2D::ScaleBy(const float scale)
{
	this->size += size;
}

void Transform2D::MoveBy(const glm::vec2& distance)
{
	this->position += distance;
}
```

Для превращения Transform2D в матрицу трансформации надо выполнить несколько умножений матриц.

> Компоненты трансформации применяются в строго определённом порядке, при изменении которого компоненты потеряют свой текущий смысл — например, компонент поворота, применённый после компонента перемещения, перестанет быть ориентацией фигуры и станет поворотом вокруг центра системы координат.

```cpp
// Метод использует расширение GLM_GTX_matrix_transform_2d
// См. https://glm.g-truc.net/0.9.9/api/a00209.html
glm::mat3 Transform2D::ToMat3() const
{
	glm::mat3 mat;
	mat = glm::translate(mat, position);
	mat = glm::rotate(mat, orientation);
	mat = glm::scale(mat, size);

	return mat;
}

// Метод использует расширения GLM_GTC_matrix_transform
// См. https://glm.g-truc.net/0.9.9/api/a00169.html
glm::mat4 Transform2D::ToMat4() const
{
	glm::mat4 mat;
	mat = glm::translate(mat, { position.x, position.y, 0 });
	mat = glm::rotate(mat, orientation, glm::vec3(0, 0, 1));
	mat = glm::scale(mat, { size.x, size.y, 1 });

	return mat;
}
```
