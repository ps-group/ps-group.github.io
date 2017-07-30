---
title: 'Задание: вывод информации об ОС'
---

Требуется в команде из двух человек написать программу, выводящую основную информацию о системе в двух разных ОС. Информация может включать в себя:

- название и человекочитаемую версию ОС, например, "Windows 8.1", "Windows 8.1 Enterprise", "Windows Vista" или "Debian GNU/Linux 6"
- имя активного пользователя, например, "sergey"
- имя компьютера в локальной сети, например "sergey-A17M"
- для UNIX-платформ — версию ядра ОС

Программа должна содержать класс CSystemInfo, который и реализует получение информации о системе с помощью методов GetOsVersion, GetOsUserName, GetComputerName и т.д. Методы этого класса должны быть реализованы под разные операционные системы с помощью условной компиляции:

```cpp
#if defined(_WIN32)
// Если объявлен макрос _WIN32, это ОС семейства Windows

#elif defined(__linux__)
// Если объявлен макрос __linux__, это одна из ОС семейства Linux
//   либо Android, также базирующийся на ядре Linux,

#elif defined(__APPLE__)
// Если объявлен макрос __APPLE__, это одна из ОС семейства Apple,
//    на настольных машинах — MacOSX

#endif
```

Источники информации:

- [Pre-defined Compiler Macros, Operating Systems (sourceforge.net)](https://sourceforge.net/p/predef/wiki/OperatingSystems/)
- [Standard Predefined Macros (sourceforge.net)](http://gcc.gnu.org/onlinedocs/cpp/Standard-Predefined-Macros.html)
