---
title: 'Полезные утилиты библиотеки Boost'
---

## Токенизация

Для разбиения текста на слова подходит `boost::split`. Рассмотрим пример ниже:

```cpp
vector<string> SplitWords(string const& text)
{
	std::string trimmed = boost::trim_copy(text);
	vector<string> words;
	boost::split(words, trimmed, boost::is_space(), boost::token_compress_on);
	return words;
}
```

- предикат, возвращённый функцией 'boost::is_space()', отмечает пробельные символы как разделители
- token_compress_on гарантирует склеивание нескольких пробельных символов в один
- 'boost::trim' убирает пробельные символы в начале и в конце текста (иначе в words окажутся пустые слова)
