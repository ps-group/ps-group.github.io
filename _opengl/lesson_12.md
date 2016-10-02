---
title: 'Игра Memory Trainer 3D'
---

В этом примере будет показана реализация полноценной интерактивной игры, позволяющей взаимодействовать с объектами в 3D-пространстве.

![Скриншот](figures/lesson_12_preview.png)

## Геймплей

Суть игры заключается в следующем:

- пользователю показывается игровое поле M * N табличек (всего табличек четное число)
- изначально таблички повёрнуты оборотной стороной (текстура оборотной стороны одинакова для всех табличек)
- при щелчке по плитке она плавно переворачивается лицевой стороной, на которой нарисована некоторая картинка
- если до этого была открыта плитка с тем же рисунком, то обе плитки удаляются с поля (игрок получает 50 очков)
- в противном случае обе плитки плавно поворачиваются обратно рубашкой вверх (игрок теряет 10 очков)
- повторный щелчок по ячейке, повернутой к нам картинкой, вызывает ее обратный поворот рубашкой вверх.

Цель игры – убрать все плитки с игрового поля.

## Модель и представление плиток

## Пересечение луча и плоскости

## Активация и вращение плиток

## Генератор изображений плиток

## HUD-интерфейс в классе CHeadUpDisplay

Для вывода интерфейса мы воспользуемся принципом, известным как Head Up Display &mdash; то есть будем рисовать интерфейс поверх основной сцены, предварительно переключившись в режим 2D графики.

Чтобы рисовать изображение в пиксельных координатах клиентской области окна, нам потребуется знать размеры окна. Поскольку размеры окна меняются, в конструктор класса CHeadUpDisplay вместо значения размера будем передавать функцию, которая возвращает размер. Таким будет определение класса после его создания:

```cpp
class CHeadUpDisplay : public ISceneObject
{
public:
    using GetWindowSizeFn = std::function<glm::ivec2()>;

    CHeadUpDisplay(const GetWindowSizeFn &getWindowSize);

    void Update(float dt)final;
    void Draw()const final;

private:
    GetWindowSizeFn m_getWindowSize;
};
```

Метод Draw должен переключить режим 3D на 2D, и настроить матрицу ортографического проецирования, затем выполнить рисование и в конце восстановить состояние контекста OpenGL:

```cpp
template <class T>
void DrawWithOrthoView(const ivec2 winSize, T && callback)
{
    // Матрица ортографического проецирования изображения в трёхмерном пространстве
    // из параллелипипеда с размером, равным (size.X x size.Y x 2),
    // на плоскость viewport.
    const mat4 projection = glm::ortho<float>(0, float(winSize.x), float(winSize.y), 0);
    const mat4 identity;

    // Сохраняем и замещаем матрицу проецирования.
    glMatrixMode(GL_PROJECTION);
    glPushMatrix();
    glLoadMatrixf(glm::value_ptr(projection));
    glMatrixMode(GL_MODELVIEW);

    // Сохраняем и замещаем матрицу моделирования-вида.
    glPushMatrix();
    glLoadMatrixf(glm::value_ptr(identity));

    // Вызываем переданный функтор
    callback();

    // Возвращаем исходное состояние матриц
    glMatrixMode(GL_PROJECTION);
    glPopMatrix();
    glMatrixMode(GL_MODELVIEW);
    glPopMatrix();
}

void CHeadUpDisplay::Draw() const
{
    glDisable(GL_LIGHTING);
    glDisable(GL_DEPTH_TEST);
    glDisable(GL_CULL_FACE);
    DrawWithOrthoView(m_getWindowSize(), [this] {
        // Будем рисовать здесь.
    });
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glEnable(GL_LIGHTING);
}
```

## Вывод текста в текстуру средствами SDL_ttf

Для вывода текста средствами OpenGL мы сделаем следующее:

- каждая строка будет претерпевать *растеризацию* &mdash; процесс превращения в растровое изображение; выполнять этот этап мы будем средствами SDL2_ttf
- затем растровое изображение в виде объекта SDL_Surface будет копироваться в видеопамять в качестве текстуры
- наконец, мы будем накладывать текстуру на прямоугольник с размером, равным размеру текстуры, под действием ортогональной матрицы проецирования и единичной матрицы моделирования вида; это позволит вывести изображение на экран пиксель-в-пиксель

Для растеризации текста нам потребуется загрузить шрифт из файла с расширением `*.ttf` на диске в объект типа [TTF_Font](http://www.libsdl.org/projects/SDL_ttf/docs/SDL_ttf_56.html#SEC56). Чтобы избежать ручной работы с памятью, объявим умный указатель:

```cpp
namespace detail
{
struct TtfFontDeleter
{
    void operator ()(TTF_Font *font)
    {
        TTF_CloseFont(font);
    }
};
}

using TTFFontPtr = std::unique_ptr<TTF_Font, detail::TtfFontDeleter>;
```

Для загрузки шрифта мы напишем вспомогательный статический метод класса `CFilesystemUtils`:

```cpp
TTFFontPtr CFilesystemUtils::LoadFixedSizeFont(const boost::filesystem::path &path, int pointSize)
{
    const std::string pathUtf8 = ConvertPathToUtf8(GetResourceAbspath(path));
    TTFFontPtr pFont(TTF_OpenFont(pathUtf8.c_str(), pointSize));
    if (!pFont)
    {
        throw std::runtime_error("Cannot find font at " + path.generic_string());
    }

    return pFont;
}
```

Производить растеризацию текста в текстуру с выбранным шрифтом и цветом будет статический метод класса CUtils:

```cpp
SDLSurfacePtr CUtils::RenderUtf8Text(TTF_Font &font, const std::string &text, const glm::vec3 &color)
{
    using namespace glm;

    const vec3 scaledColor = 255.f * clamp(color, vec3(0.f), vec3(1.f));
    SDL_Color rgbaColor;
    rgbaColor.r = Uint8(scaledColor.r);
    rgbaColor.g = Uint8(scaledColor.g);
    rgbaColor.b = Uint8(scaledColor.b);
    rgbaColor.a = 255;

    return SDLSurfacePtr(TTF_RenderUTF8_Blended(&font, text.c_str(), rgbaColor));
}
```

Наконец, в классе CHeadUpDisplay появится поле m_pFont и приватный метод RasterizeText, непосредственно выполняющий растеризацию:

```cpp
const char FONT_RESOURCE_PATH[] = "res/memory-trainer/Ubuntu-R.ttf";

CHeadUpDisplay::CHeadUpDisplay(const CHeadUpDisplay::GetWindowSizeFn &getWindowSize)
    : m_getWindowSize(getWindowSize)
{
    m_pFont = CFilesystemUtils::LoadFixedSizeFont(FONT_RESOURCE_PATH, FONT_POINTS_SIZE);
}

CTexture2DUniquePtr CHeadUpDisplay::RasterizeText(const std::string &text)const
{
    SDLSurfacePtr pSurface = CUtils::RenderUtf8Text(*m_pFont, text, WHITE_RGB);
    const ivec2 surfaceSize = { pSurface->w, pSurface->h };

    const GLenum pixelFormat = GL_RGBA;
    const uint32_t requiredFormat = SDL_PIXELFORMAT_ABGR8888;
    if (pSurface->format->format != requiredFormat)
    {
        pSurface.reset(SDL_ConvertSurfaceFormat(pSurface.get(), requiredFormat, 0));
    }

    auto pTexture = std::make_unique<CTexture2D>(surfaceSize, true);
    pTexture->DoWhileBinded([&] {
        glTexImage2D(GL_TEXTURE_2D, 0, GLint(pixelFormat), pSurface->w, pSurface->h,
            0, pixelFormat, GL_UNSIGNED_BYTE, pSurface->pixels);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    });

    return pTexture;
}
```

## Класс CSprite

Для рисования надписи нам потребуется спрайт &mdash; прямоугольник, на который наложена текстура. Кроме того, одна надпись будет размещена в левом углу экрана, а другая &mdash; в правом углу:

![Скриншот](figures/lesson_12_preview.png)

Чтобы добиться подобного эффекта, нам пригодится принцип anchor point: позиция спрайта будет означать позицию некоторой "точки крепления" (*англ.* anchor point), к которой этот спрайт будет "прицеплен" на окно. В итоге спрайт будет иметь три свойства: position, size и anchorPoint.

```cpp
struct SVertexP2T2
{
    glm::vec2 position;
    glm::vec2 texCoord;
};

// Класс представляет двумерный текстурированный спрайт,
//  обладающий размером, положением и точкой крепления
//  спрайта к своему положению (она задаётся в диапазоне [0..1]).
// По умолчанию точка крепления - левый верхний угол,
//  то есть положение спрайта определяет положение
//  его левого верхнего угла.
class CSprite : public ISceneObject
{
public:
    void Update(float dt) final;
    void Draw() const final;

    glm::vec2 GetPosition()const;
    glm::vec2 GetSize() const;
    const CTexture2D &GetTexture() const;
    bool HasTexture()const;

    void SetPosition(const glm::vec2 &position);
    void SetSize(const glm::vec2 &size);
    void SetAnchorPoint(const glm::vec2 &point);
    void SetTexture(CTexture2DUniquePtr &&pTexture);

private:
    void Tesselate();

    std::vector<SVertexP2T2> m_vertices;
    std::vector<uint8_t> m_indicies;
    CTexture2DUniquePtr m_pTexture;
    glm::vec2 m_position;
    glm::vec2 m_size;
    glm::vec2 m_anchorPoint;
    bool m_didTesselate = false;
};
```

Чтобы не пересчитывать вершины спрайта после каждого изменения свойства, мы воспользуемся идиомой [Dirty Flag](http://gameprogrammingpatterns.com/dirty-flag.html), то есть будем хранить булеву переменную, которая обозначает необходимость обновления геометрии спрайта и проверяется в методе Update:

```cpp
// Сравнивать действительные числа, обозначающие
//  координаты на сетке пикселей, можно приближённо.
bool ArePixelCoordsCloseEqual(const vec2 &a, const vec2 &b)
{
    const float epsilon = 0.001f;
    return (fabsf(a.x - b.x) < epsilon)
            && (fabsf(a.y - b.y) < epsilon);
}

void CSprite::Update(float)
{
    if (!m_didTesselate)
    {
        Tesselate();
        m_didTesselate = true;
    }
}

const CTexture2D &CSprite::GetTexture() const
{
    return *m_pTexture;
}

bool CSprite::HasTexture() const
{
    return bool(m_pTexture);
}

void CSprite::SetTexture(CTexture2DUniquePtr &&pTexture)
{
    m_pTexture = std::move(pTexture);
}

vec2 CSprite::GetPosition() const
{
    return m_position;
}

void CSprite::SetPosition(const vec2 &position)
{
    if (!ArePixelCoordsCloseEqual(m_position, position))
    {
        m_position = position;
        m_didTesselate = false;
    }
}

vec2 CSprite::GetSize() const
{
    return m_size;
}

void CSprite::SetSize(const vec2 &size)
{
    if (!ArePixelCoordsCloseEqual(m_size, size))
    {
        m_size = size;
        m_didTesselate = false;
    }
}

void CSprite::SetAnchorPoint(const vec2 &point)
{
    if (!ArePixelCoordsCloseEqual(m_anchorPoint, point))
    {
        m_anchorPoint = glm::clamp(point, vec2(0.f), vec2(1.f));
        m_didTesselate = false;
    }
}

void CSprite::Tesselate()
{
    const float left = m_position.x - m_anchorPoint.x * m_size.x;
    const float top = m_position.y - m_anchorPoint.y * m_size.y;
    const float right = m_position.x + (1.f - m_anchorPoint.x) * m_size.x;
    const float bottom = m_position.y + (1.f - m_anchorPoint.y) * m_size.y;

    SVertexP2T2 vLeftTop{ vec2(left, top), vec2(0, 0) };
    SVertexP2T2 vRightTop{ vec2(right, top), vec2{1, 0} };
    SVertexP2T2 vLeftBottom{ vec2(left, bottom), vec2{0, 1} };
    SVertexP2T2 vRightBottom{ vec2(right, bottom), vec2{1, 1} };

    m_vertices = { vLeftTop, vRightTop, vLeftBottom, vRightBottom };
    m_indicies = { 0, 1, 2, 1, 3, 2 };
}
```

Рисование спрайта будет выполняться привычным способом. Единственным нюансом будет необходимость включения режима смешивания, т.к. задний фон текстовой надписи может быть и будет прозрачным.

```cpp
/// Привязывает вершины к состоянию OpenGL,
/// затем вызывает 'callback'.
template <class T>
void DoWithBindedArrays(const std::vector<SVertexP2T2> &vertices, T && callback)
{
    // Включаем режимы привязки нужных данных.
    glEnableClientState(GL_VERTEX_ARRAY);
    glEnableClientState(GL_TEXTURE_COORD_ARRAY);

    // Выполняем привязку vertex array, normal array, texture array.
    const size_t stride = sizeof(SVertexP2T2);
    glVertexPointer(2, GL_FLOAT, stride, glm::value_ptr(vertices[0].position));
    glTexCoordPointer(2, GL_FLOAT, stride, glm::value_ptr(vertices[0].texCoord));

    // Выполняем внешнюю функцию.
    callback();

    // Выключаем режимы привязки данных.
    glDisableClientState(GL_TEXTURE_COORD_ARRAY);
    glDisableClientState(GL_VERTEX_ARRAY);
}

void CSprite::Draw() const
{
    if (!m_pTexture)
    {
        return;
    }
    bool hasAlpha = m_pTexture->HasAlpha();
    m_pTexture->DoWhileBinded([&] {
        if (hasAlpha)
        {
            glEnable(GL_BLEND);
            glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        }
        DoWithBindedArrays(m_vertices, [&] {
            glDrawElements(GL_TRIANGLES, GLsizei(m_indicies.size()),
                           GL_UNSIGNED_BYTE, m_indicies.data());
        });
        if (hasAlpha)
        {
            glDisable(GL_BLEND);
        }
    });
}
```

## Обновление индикаторов

Для представления индикатора мы используем тот же приём Dirty Flag и опишем структуру SUnsignedIndicator, объявленную как вложенный символ класса CHeadUpDisplay:

```cpp

class CHeadUpDisplay
{
public:
    using GetWindowSizeFn = std::function<glm::ivec2()>;

    CHeadUpDisplay(const GetWindowSizeFn &getWindowSize);

    void SetScore(unsigned value);
    void SetTilesLeft(unsigned value);

    void Update(float dt)final;
    void Draw()const final;

private:
    struct SUnsignedIndicator
    {
        CSprite sprite;
        unsigned value = 0;
        bool didRasterize = false;
    };

    CTexture2DUniquePtr RasterizeText(const std::string &text) const;
    void UpdateIndicator(SUnsignedIndicator &indicator, const char *textPrefix)const;
    void SetIndicatorValue(SUnsignedIndicator &indicator, unsigned value)const;

    GetWindowSizeFn m_getWindowSize;
    TTFFontPtr m_pFont;
    SUnsignedIndicator m_score;
    SUnsignedIndicator m_tilesLeft;
};
```

Во вспомогательном методе UpdateIndicator будет происходить растеризация надписи на индикаторе по требованию. В методе SetIndicatorValue будет выполняться установка значения и булева флага о необходимости повторной растеризации надписи:

```cpp
void CHeadUpDisplay::UpdateIndicator(CHeadUpDisplay::SUnsignedIndicator &indicator,
                                     const char *textPrefix) const
{
    if (!indicator.didRasterize)
    {
        const std::string text = textPrefix + std::to_string(indicator.value);
        auto pTexture = RasterizeText(text);
        indicator.sprite.SetSize(vec2(pTexture->GetSize()));
        indicator.sprite.SetTexture(std::move(pTexture));
        indicator.didRasterize = true;
    }
}

void CHeadUpDisplay::SetIndicatorValue(CHeadUpDisplay::SUnsignedIndicator &indicator, unsigned value) const
{
    if (indicator.value != value)
    {
        indicator.value = value;
        indicator.didRasterize = false;
    }
}
```

Теперь рассмотрим реализации остальных методов класса:

```cpp
void CHeadUpDisplay::SetScore(unsigned value)
{
    SetIndicatorValue(m_score, value);
}

void CHeadUpDisplay::SetTilesLeft(unsigned value)
{
    SetIndicatorValue(m_tilesLeft, value);
}

void CHeadUpDisplay::Update(float dt)
{
    UpdateIndicator(m_score, "score: ");
    UpdateIndicator(m_tilesLeft, "tiles left: ");

    m_score.sprite.SetPosition(vec2(LABEL_MARGIN_X, LABEL_MARGIN_Y));
    m_score.sprite.Update(dt);

    const float windowWidth = float(m_getWindowSize().x);
    m_tilesLeft.sprite.SetAnchorPoint(vec2(1, 0));
    m_tilesLeft.sprite.SetPosition(vec2(windowWidth - LABEL_MARGIN_X, LABEL_MARGIN_Y));
    m_tilesLeft.sprite.Update(dt);
}

void CHeadUpDisplay::Draw() const
{
    glDisable(GL_LIGHTING);
    glDisable(GL_DEPTH_TEST);
    glDisable(GL_CULL_FACE);
    DrawWithOrthoView(m_getWindowSize(), [this] {
        m_score.sprite.Draw();
        m_tilesLeft.sprite.Draw();
    });
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glEnable(GL_LIGHTING);
}
```

## Победа игрока

Игрок побеждает, когда на карте больше не остаётся плиток. Проверку данной ситуации можно поместить в различных местах. Мы поместим её в `CWindow::Update`, чтобы отслеживать момент победы сразу после обновления состояния поля:

```cpp
void CWindow::OnUpdateWindow(float deltaSeconds)
{
    m_camera.Update(deltaSeconds);
    m_pField->Update(deltaSeconds);
    m_pHud->SetTilesLeft(m_pField->GetTileCount());
    m_pHud->SetScore(m_pField->GetTotalScore());
    m_pHud->Update(deltaSeconds);

    if (m_pField->GetTileCount() == 0)
    {
        ShowGameOverMessage();
    }
}
```

В случае победы программа должна дальше совершить какое-либо активное действие. Можно привести несколько примеров:

- переход на новый уровень игры
- предложение посмотреть свой рейтинг среди прошлых партий игры и выбрать из меню
- предложение запустить новую игру или завершить игру
- либо просто информативное сообщение, после которого программа завершается

Мы выберем последний способ как самый простой в реализации и вполне подходящий для нашего примера. В этом случае метод ShowGameOverMessage будет использовать API библиотеки SDL2, чтобы сначала показать Message Box, а затем поместить событие SDL_QUIT в очередь событий. Реализация показана ниже:

```cpp
void CWindow::ShowGameOverMessage()
{
    // Показываем диалог с поздравлением.
    const unsigned totalScore = m_pField->GetTotalScore();
    const char title[] = "You won!";
    const std::string message =
            "Congratuations, you won the game!"
            "\nTotal score: " + std::to_string(totalScore);
    SDL_ShowSimpleMessageBox(SDL_MESSAGEBOX_INFORMATION, title,
                             message.c_str(), nullptr);

    // Добавляем событие завершения программы.
    SDL_Event quitEvent;
    quitEvent.type = SDL_QUIT;
    quitEvent.quit.timestamp = SDL_GetTicks();
    SDL_PushEvent(&quitEvent);
}
```

Так выглядит окно после победы (после нажатия на OK программа завершается):

![Скриншот](figures/memory_trainer_3d_player_won.png)

## Результат

Вы можете взять [полный пример к статье на github](https://github.com/PS-Group/cg_course_examples/tree/master/chapter_2/lesson_12). А вот так выглядит окно после запуска:

![Скриншот](figures/lesson_12_preview.png)

## Ссылки

- [Статья о растеризации текста с помощью SDL_ttf](http://www.sdltutorials.com/sdl-ttf)
