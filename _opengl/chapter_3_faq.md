---
title: 'F.A.Q. по 3-й главе'
preview: img/help-contents.png
---

## Отладка освещения в шейдерах

Допустим, вы написали свой шейдер для расчёта освещения, но он не работает: освещение вычисляется не так, как вы ожидали.

Напрямую отладить процесс выполнения вершинного или фрагментного шейдера едва ли получится, потому что шейдеры выполняются на видеокарте. Тем не менее, можно визуализировать возможные проблемы с помощью яркого цвета. Пусть у нас есть шейдер для попиксельного рассеянного освещения (по закону Ламберта):

```glsl
void main(void)
{
    vec4 result = vec4(0.0);
    for (int li = 0; li < gl_MaxLights; ++li)
    {
        vec3 delta = gl_LightSource[li].position.w * v;
        vec3 lightDirection = normalize(gl_LightSource[li].position.xyz - delta);

        vec4 Iamb = gl_FrontLightProduct[li].ambient;

        float diffuseAngle = max(dot(n, lightDirection), 0.0);
        vec4 Idiff = gl_FrontLightProduct[li].diffuse * diffuseAngle;
        Idiff = clamp(Idiff, 0.0, 1.0);

        result += Iamb + Idiff;
    }

    gl_FragColor = gl_FrontLightModelProduct.sceneColor + result;
}
```

В примере при рендеринге получалась следующее:

![Скриншот](figures/smooth_lambert_lighting.png)

В нашем случае успешно нарисована сфера. Но что делать, если экран окрашен в чёрный цвет? Такое может возникать по двум причинам:

- цвет очистки буфера из-за ошибки совпадает с цветом выводимых фрагментов
- фрагменты из-за ошибки не попадают на экран (смещено положение камеры, неправильно выводится геометрия и так далее)

Чтобы определить, попадают ли фрагменты на экран, можно добавить к gl_FragColor красный цвет:

```glsl
    const vec4 RED_RGBA = vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor = gl_FrontLightModelProduct.sceneColor + result + RED_RGBA;
```

![Скриншот](figures/lambert-red-colored.png)

## SDL2_ttf.dll выдаёт ошибку на Windows в Debug-конфигурации

Проблема описана в сети, например, в вопросе [The procedure entry point interlockedcompareexchange@12 could not be located in the dynamic link library SDL2_ttf.dll](http://stackoverflow.com/questions/38639337/). Ошибка, очевидно, находится в недрах библиотек SDL2_ttf и libfreetype. Есть простое решение, хотя и странное:

- Если DLL-библиотеки `SDL2_ttf` и `libfreetype` и `zlib` лежат в том же каталоге, где лежит `*.exe`, то проблемы не возникает. Настройте процесс сборки или скопируйте DLL вручную.
