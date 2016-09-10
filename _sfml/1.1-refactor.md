---
title: Задание - Рефакторинг С++ Кода
---

В рамках этого задания потребуется отрефакторить существующий код. Следует обратить внимание на:

- [Соглашения о кодировании](coding_conventions.html)
- Правильное именование переменных
- Отсутствие предупреждений компилятора
- Нормальную работу в режиме прикреплённого отладчика (F5 в Visual Studio)
- Нормальную работу в режиме запуска без отладчика (Ctrl+F5 в Visual Studio или запуск из консоли)
- Единообразный способ выбора идентификаторов (при этом для сущностей разных категорий способ именования может различаться)

Перед началом рефакторинга следует запустить код на пошаговую отладку и изучить его поведение.

Подсказка по комбинациям клавиш в Visual Studio:

- F5: запуск отладчика
- Shift+F5: быстрое завершение отладки (с закрытием программы)
- F9: переключение точки останова (breakpoint)
- F10: переход на одну инструкцию вперёд (step over)
- F11: переход в тело вызываемой в данной инстуркции функции (step into)
- Shift+F11: выход из тела фукнции (step out)

## Вариант 1: программа для просчёта высоты прыжка

Изложенная ниже программа симулирует физику прыжка в условных единицах измерения. Предполагается, что ускорение свободного падения равно 9.8 (метров на секунду в квадрате), и начальная скорость в момент прыжка придаётся мгновенно.

- программа получает на вход высоту прыжка
- вычисляет и выводит время, когда будет достигнута максимальная высота
- затем с шагом 0.1 проходит по всем моментам времени между началом и концом прыжка и выводит высоту в этот момент времени
- кроме того, обязательно выводится момент середины прыжка и момент конца прыжка

```cpp
// Если используется stdafx.h, перенесите директиву define в начало stdafx.h, 
#define _CRT_SECURE_NO_WARNINGS

#include <iostream>
#include <string>
#include <vector>
#include <cmath>

// This program takes max jump height from input and prints
// jump height for every time point with step 0.1 seconds.
// Program should print all time points when height is min and max.
//
// TODO: Fix all warnings on high warning level (/W4, -Wall -Wextra).
// TODO: Rename variables and split to several functions,
// see also https://ps-group.github.io/sfml/coding_conventions.html
// TODO: fix negative height values, fix heigh values higher than max height.
int main(int, char *[])
{
	const float g = 9.8f;
	float T;
	float Vn;
	int S;
	int M;
	printf("S: ");
	if (0 == scanf("%d", &S))
	{
		printf("\n" "expected floating-point number" "\n");
		exit(1);
	}
	// T - time point when height is at maximum.
	// t - current time point
	// v(t) == v0 - g * t
	// v0 = g * T
	// s(t) == v0 * t - 0.5 * g * t * t
	T = sqrt(S * 2 / g);
	printf("T=%f\n", T);
	bool flag = false;
	for (float t = 0; t < T * 2; t += 0.1f)
	{
		if (t > T && !flag)
		{
			flag = true;
			float V0 = g * T;
			float s = V0 * T - 0.5 * g * T * T;
			printf("t=%f, s=%f\n", T, s);
		}
		float V0 = g * T;
		float s = V0 * t - 0.5 * g * t * t;
		printf("t=%f, s=%f\n", t, s);
	}

	float V0 = g * T;
	float s = V0 * (T*2) - 0.5 * g * (T * 2) * (T * 2);
	printf("t=%f, s=%f\n", T * 2, s);

	// TODO: remove system("pause") and never use it again.
	system("pause");

	return 0;
}
```
