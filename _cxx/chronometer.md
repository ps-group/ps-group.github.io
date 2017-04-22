---
title: 'Явное ожидание завершения кадра'
---

## Игровой цикл с ожиданием завершения кадра

Общая идея состоит в том, чтобы установить интервал между кадрами *не менее* 16 миллисекунд. Если игра не тормозит, FPS застынет в районе 60 Гц, в противном случае игра будет стараться нарисовать максимально близкое к 60 число кадров, занимая всё процессорное время.

```cpp
using namespace std::chrono;

// Запрашивает время, прошедшее с последнего кадра, и обновляет lastFrameTime
float GrabDeltaTime(system_clock::time_point &lastFrameTime)
{
    auto newTime = system_clock::now();
    auto timePassed = duration_cast<milliseconds>(newTime - m_lastTime);
    lastFrameTime = newTime;
    return 0.001f * float(timePassed.count());
};

// Ожидает до момента времени `lastFrameTime + framePeriod`
void WaitNextFrameTime(const system_clock::time_point &lastFrameTime, const milliseconds &framePeriod)
{
    system_clock::time_point nextFrameTime = lastFrameTime + framePeriod;
    std::this_thread::sleep_until(nextFrameTime);
}

const milliseconds FRAME_PERIOD(16);

void main()
{
    // Инициализация игры.

    system_clock::time_point lastFrameTime;

    while (window.isOpen())
    {
        const float dt = GrabDeltaTime(lastFrameTime);

        // Обработка событий (handle events)
        // Обновление сцены (update)
        window.clear(sf::Color::Black);
        // Рисование состояния игры в буфер кадра.
        window.display();

    	chronometer.WaitNextFrameTime(lastFrameTime, FRAME_PERIOD);
    }

    return 0;
}
```

## Оборачиваем работу со временем в класс CChronometer

Вспомогательный класс позволит упростить исчесление промежутков времени &mdash; необходимые данные он хранит вокруг себя.

```cpp
// Класс отвечает за измерение промежутков времени между кадрами
//  и за ожидание следующего кадра.
class CChronometer
{
public:
	CChronometer();
	float GrabDeltaTime();

	void WaitNextFrameTime(const std::chrono::milliseconds &framePeriod);

private:
	std::chrono::system_clock::time_point m_lastTime;
};

float CChronometer::GrabDeltaTime()
{
	auto newTime = system_clock::now();
	auto timePassed = duration_cast<milliseconds>(newTime - m_lastTime);
	m_lastTime = newTime;
	return 0.001f * float(timePassed.count());
};

void CChronometer::WaitNextFrameTime(const milliseconds &framePeriod)
{
	system_clock::time_point nextFrameTime = m_lastTime + framePeriod;
	std::this_thread::sleep_until(nextFrameTime);
}
```

