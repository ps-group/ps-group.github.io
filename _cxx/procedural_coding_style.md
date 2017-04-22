---
title: "Соглашения о кодировании на C++ в процедурном стиле"
---

Стиль даётся как рекомендация. Допускается изменить отдельные правила, если на то есть причина. Тем не менее, не надо использовать разные стили кода в одном проекте, за исключением изолированных от остального кода внешних библиотек.

## Примеры

```cpp
static const char FONT_UBUNTU_TTF[] = "../fonts/Ubuntu-R.ttf";

struct Application
{
    static const int DEFAULT_FPS = 60;
    static const int WINDOW_WIDTH = 800;
    static const int WINDOW_HEIGHT = 600;

    Application();
    void exec();

    sf::RenderWindow window;
    Assets assets;
    CustomButton buttonExample;
    int timesPressed = 0;
};

void CustomButton::draw(RenderWindow& window)
{
    FloatRect textBounds = text.getLocalBounds();
    text.setOrigin(0.5f * textBounds.width, textBounds.height);
    text.setPosition(shape.getPosition() + 0.5f * shape.getSize());
    window.draw(shape);
    window.draw(text);
}

int main()
{
    Application app;
    app.Exec();
    return 0;
}
```

## Общие правила именования

- идентификаторы констант пишутся в верхнем регистре с подчёркиванием: ```static const int DEFAULT_FPS = 60;```
- идентификаторы типов пишутся в верблюжьем стиле, начиная с буквы верхнего регистра: ```struct Application```
- идентификаторы локальных переменных и параметров функций пишутся в верблюжьем стиле, начиная с буквы нижнего регистра: ```int dx = x * speed * deltaTime;```
- идентификаторы функций пишутся в верблюжьей нотации с маленькой буквы, начиная с глагола: ```getLocalBounds(), append(), computeLabelWidth(), findSlash(), getWidth()```; по желанию можно именовать все функции в верблюжьей нотации с большой буквы: ```GetLocalBounds(), Append(), ComputeLabelWidth(), FindSlash(), GetWidth()```
- не стоит использовать однобуквенные переменные, за исключением локальных переменных с маленькой областью видимости и очевидным смыслом: ```i, n, x, y```
- не злоупотребляйте сокращением слов, ни в коем случае не отходите от общепринятых сокращений

### Таблица глаголов для имён функций

| Задача       | Имена        |
| ------------ | ------------ |
| Доступ данным, защищённым от прямого обращения | get/set/reset |
| Вычисление или обновление состояния | compute, calculate |
| Поиск и замена | find, replace |
| Вставка элемента | insert, append, push, pop, add |
| Удаление элемента | remove, erase |
| Создание новой структуры в динамической области памяти | new, create, make |
| Инициализация созданной ранее структуры | init (initialize) |
| Очистка данных и удаление указателя | delete, destroy |
| Перемещение | move |
| Обновление состояния | update, animate, advance|
| Изменение размера | resize, setSize, setScale|
| Запуск или остановка анимации или процесса | run, start, play, stop, pause, resume|

### Исключения в именовании

- идентификаторы математических функций можно писать без глагола в начале: ```sin, cos, cartesian, cross, dot```.
- если переменная имеет тип bool её название строится как вопрос на английском языке: ```isDirectoryExists```, ```isImageFile```, ```doesFollow```.
- если функция возвращат тип bool и не меняет состояние программы, то её название тоже строится как вопрос на английском языке
- у глобальных переменных добавляется префикс ```g_```, если, конечно, вы хотите использовать глобальные переменные: ```int g_unitsCount = 0;```
- у статических локальных переменных добавляется префикс ```s_```, если, конечно, вы хотите их использовать

### Не приветствуется

- Не стоит использовать глобальные переменные, лучше завести структуру ```struct Application``` и передавать её по ссылке везде, где нужны данные, глобальные для приложения.
- Не стоит писать магические числа в коде, чтобы читающий код не задавался вопросами "почему 4?", "почему 37?", "что будет, если 36 заменить на 50 в этой строке?". Используйте именованные константы или enum class

```cpp
const float DEFAULT_SPEED = 0.2f;

enum class Direction
{
    Up,
    Down,
    Left,
    Right
};
```

- SLOC (Source Lines of Code) — это мера длины функций, обычно 1 SLOC = 1 строка кода. Не должно быть функции длиннее 25 SLOC, за исключением особых случаев. Функция main не должна быть длинее 10 SLOC
- Не стоит выводить в лог "сырые" данные (числа, строки и так далее). Даже к отладочному выводу следует добавлять короткие аннотации. Пример:

```cpp
for (size_t i = 0; i < vertexCount; ++i)
{
	size_t vertexId = boost::add_vertex(m_graph);
	std::cerr << "vertexId=" << vertexId << std::endl;
}
```

- не стоит выделять память в инициализаторах полей структур, лучше завести функцию InitXXX, которая выделит память для переданной структуры

Дурной код:

```cpp
struct Entity
{
    sf::Sprite *pSprite = new sf::Sprite;
    sf::Texture *pTexture = new sf::Texture;
};
```
Приемлемый код:

```cpp
struct Picture
{
    sf::Sprite *pSprite = nullptr;
    sf::Texture *pTexture = nullptr;
};

void initPicture(Picture &picture, std::string const& path);

void foo()
{
    Picture banner;
    initPicture(banner, "images/ad_banner.png");
}
```

### Дополнительные материалы
- Стив Макконнелл, "Совершенный Код" ("Code Complete")
- [видео доклада "Цена ошибки" на C++ Russia 2015](https://www.youtube.com/watch?v=fqmk67ivDTU&index=9&list=PLrs_DcVZNww22J_uDSJn7bLNOlly7n8p2)
- [C++ Crash Course for C programmers](http://www.labri.fr/perso/nrougier/teaching/c++-crash-course/)
