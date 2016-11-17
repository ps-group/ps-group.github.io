---
title: "Явное преобразование типов в языке C++"
---

## Преобразование скалярных типов

## Неявное преобразование

- Происходит в выражениях, выполняющих операции над операндами разных типов
- Происходит при вызове функции с аргументами, типы которых отличаются от типов параметров, но могут быть к ним приведены

Данный код иллюстрирует некоторые правила неявного преобразования в выражениях. Пример использует static_assert для проверки правильности предположений:

```cpp
#include <type_traits>

template <class TExpected, class T>
void CheckValueType(const T &value)
{
	static_assert(std::is_same<T, TExpected>::value, "types are not same");
}

int main()
{
	{
		short shortValue = 10;
		short shortValue2 = 15;
		auto resultValue = shortValue + shortValue2;
		CheckValueType<int>(resultValue);
	}

	{
		float floatValue = 3.14f;
		double doubleValue = 2.71;
		auto resultValue = floatValue + doubleValue;
		CheckValueType<double>(resultValue);
	}

	{
		float floatValue = 3.14f;
		int intValue = 2;
		auto resultValue = floatValue + intValue;
		CheckValueType<float>(resultValue);
	}
}
```

- Подробное описание неявных преобразований есть на [en.cppreference.com](http://en.cppreference.com/w/cpp/language/implicit_conversion).
- Компилятор может выдавать предупреждения из-за неявных преобразований

### Делаем неявное явным

Можно сделать static_cast

```cpp
float power = /* ... */;
int value = static_cast<int>(power);
```

Другой вариант с меньшим числом символов и знаков препинания &mdash; конструирование с помощью конструктора примитивного типа:

```cpp
float power = /* ... */;

/// Преобразование путём конструирования
int value = int(power);

/// C-style cast, лучше не использовать
// int value = (int)power;
```

## Преобразования типов в стиле языка С

Явное преобразование типов в стиле C выглядит так:

```cpp
float m = (float)(a.y - b.y) / (float)(a.x - b.x);
```

Считается очень опасным, потому что снимает ограничения на константность и легко преобразует разные типы указателей. Пример ниже вызовет неопределённое поведение (скорее всего &mdash; падение программы):

```cpp
const char *greeting = "Hello World";
wchar_t *greetingW = (wchar_t *)greeting;
// Обращение к константе, потерявшей константность - неопределённое поведение
greetingW[0] = L'?';
// Использование неправильно сформированной UTF16 строки - неопределённое поведение
std::wcout << greetingW << std::endl;
```
