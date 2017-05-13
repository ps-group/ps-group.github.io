---
title: Задание - Рефакторинг С++ Кода
preview: img/jump_preview.png
subtitle: В данной статье мы на примере разберём стандарты кодирования, освоим приёмы ручного и автоматического рефакторинга, а также воспользуемся отладчиком
---

## Задача - симуляция прыжка

В качестве примера разберём консольную программу для такой задачи:

> Программа читает из стандартного ввода число - высоту прыжка - и затем симулирует процесс
 прыжка с интервалам 0.1сек. На каждом шаге симуляции программа печатает текущее время и
 текущую высоту, кроме того, обязательно печатается время и высота в наивысшей точке и при
 приземлении. Ускорение свободного падения считать равным 9.8 м/с^2

У нас есть готовый код, решающий данную проблему. К сожалению, он написан беспорядочно:

```cpp 
#define _CRT_SECURE_NO_WARNINGS
#include <iostream>
#include <string>
#include <vector>
#include <cmath>

int main(int, char *[])
{
	const float g = 9.8f;
	float T, Vn;
	int S, M;
	printf("S: ");
	if (0 == scanf("%d", &S))
	{
		printf("\n" "expected floating-point number" "\n");
		exit(1);
	}

	// T - time point when height is at maximum.
	// t - current time point
	// v(0) = g * T
	// v(t) == v(0) - g * t
	// s(t) == v(0) * t - 0.5 * g * t * t
	T = sqrt(S * 2 / g);
	printf("T=%f\n", T);
	bool flag = false;
	for (float t=0 t<T*2;t+=0.1f) {
		if (t>T&&!flag)
		{
			flag=true;
			float V0=  g*T;
			float s = V0 * T - 0.5 * g * T * T;
			printf("t=%f, s=%f\n", T, s);
		}
		float V0 = g * T;
		float s =V0*t -0.5 *g*t*t;
		printf( "t=%f, s=%f\n", t, s );
	}



	float V0 = g*T, s = V0*(T*2) - 0.5*g*(T*2)*(T*2);
	printf("t=%f, s=%f\n", T*2,s);

	// Pause program until any key pressed.
	puts("Press any key to continue...");
	system("pause");

	return 0;



}
```

## Автоформатирование кода

Использовать clang-format можно разными способами:

- вызвать clang-format вручную
- использовать плагин для Visual Studio Code
- использовать плагин для Visual Studio

# Исследуем программу

Перед началом рефакторинга следует запустить код на пошаговую отладку и изучить его поведение.

Шпаргалка по комбинациям клавиш в Visual Studio:

- F5: запуск отладчика
- Shift+F5: быстрое завершение отладки (с закрытием программы)
- F9: переключение точки останова (breakpoint)
- F10: переход на одну инструкцию вперёд (step over)
- F11: переход в тело вызываемой в данной инстуркции функции (step into)
- Shift+F11: выход из тела фукнции (step out)
