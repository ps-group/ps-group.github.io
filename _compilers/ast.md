---
title: 'Abstract Syntax Tree'
---

Сердце современных фронтендов компиляторов — абстрактное синтаксическое дерево (Abstract Syntax Tree, AST). Оно создаётся на сталдии синтаксического разбора, обрабатывается путём обхода при проверке семантических правил и проверке/определении типов, а затем также путём обхода AST выполняется кодогенерация.

- AST содержит связанные между собой экземпляры структур данных (узлов).
- При этом узлами AST можно представить все конструкции, допустимые в соответствующем языке программирования.

Допустим, программа состоит из последовательных инструкций. Каждая инструкция — это определение функции или вызов функции. Тогда структура AST может быть такой:

```
Program (struct)
    -> std::vector<Statement*> statements

StatementKind (enum class)
    -> Function
    -> Call

Statement (struct)
    -> StatementKind kind

Function : Statement (struct)
    -> std::string name
    -> std::vector<Statement*> body

Call : Statement (struct)
    -> std::string name
    -> Function* called
```

В этом случае, стадия синтаксического анализа, создающего начальное состояние AST, могла бы выглядеть так:

```cpp
auto parser = make_unique<Parser>(lexer);
auto ast = parser.parseAST();
```

### Error Recovery

Кроме создания AST, на стадии синтаксического анализа при наличии в исходном коде ошибок надо

- сгенерировать сообщения об ошибках
- постараться восстановиться после ошибок

В языках, где точка с запятой или конец строки служат разделителями, компилятору проще восстановиться после ошибок: он может просто сообщить об ошибке, проигнорировать все символы до следующего разделителя и продолжить разбор.

### Постобработка дерева

Если язык разрешает разместить вызов функции до её определения, это легко обработать:

- распарсим весь файл, включая вызовы функций, без проверки имён функций
- после окончания разбора обойти дерево и найти все вызовы необъявленных функций
- подобные шаги постобработки дерева называются "процедурами семантической проверки"

### Роль AST и семантического анализа в компиляторе

Процедуры семантической проверки дополняют AST недостающими кросс-ссылками между ветвями дерева:

- ссылками от узла вызова функции к узлу её объявления
- ссылками от узла переменной в выражении к узлу объявления локальной переменной, глобальной переменной или параметра функции
- ссылками от объявления переменной к узлу пользовательского типа данных, использованному в объявлении
- при отсутствии обязательной ссылки создаётся новое сообщение об ошибке
- также семантический анализ проверяет соответствие типов в выражениях

После семантического анализа мы получаем одно из двух:

- либо неполное AST и список ошибок в программе
- либо завершённое AST, гарантированно представляющее правильно написанную программу

После этого можно генерировать трёхадресный код, а затем отдавать его оптимизатору и кодогенератору под конкретную аппаратную платформу:

- Обычно оптимизатор и платформо-зависимый кодогенератор объединяют в "бекенд компилятора"
- Задача фронтенда компилятора — создать AST и сгенерировать из него трёхадресный код для бекенда.
- Таким образом, лексический, синтаксический и семантический анализ вместе с генератором трёхадресного кода попадают во фронтенд.

### Производительность AST

Обычно AST обходится несколько раз уже после создания. Если AST очень велико, то для приемлемой скорости узлы дерева должны располагаться в соседних областях памяти.

- Это можно реализовать с помощью применения Memory Pool (или Object Pool) для размещения в памяти узлов дерева.
- Для простых языков и небольших файлов такой подход может оказаться преждевременной оптимизацией.

### Способы обхода AST

В глубину слева направо

```js
function visit(node) {
    actionBeforeVisit(node)
    for child in node.children()
        child.accept(this)
    actionAfterVisit(node)
}
```

В глубину справа налево

```js
function visit(node) {
    actionBeforeVisit(node)
    for child in reverse(node.children())
        child.accept(this)
    actionAfterVisit(node)
}
```

В ширину слева направо (влечёт значительный расход памяти):

```js
function visit(node_list) {
    new_node_list = []
    for node in node_list {
        actionOnVisit(node)
        for child in node.children()
            new_node_list << child
    }
    visit(new_node_list)
}
```

В ширину справа налево (влечёт значительный расход памяти).

### Проблема расширяемости кода:

Программы манипулируют данными с помощью операций. В процессе эволюции программы добавляются новые типы данных и новые операции

- новая операция должна работать с существующими типами данных
- новый тип данных совместим с существующими операциями

По-настоящему расширяемый код не требует модификации существующих модулей

- модулем может считаться один файл, один класс, одна функция
- новое расширение попадает в отдельный модуль
- при расширении надо сохранить существующие абстрации
- следует сохранить типобезопасность

### Expression problem

- проблема: как реализовать гибкое добавление типов и операций в некотором языке программирования?
- типовые решения реализуют двойную диспетчеризацию: выбор ветви исполнения кода в зависимости и от типа, и от операции

### Решение 1: case-распознавание

Подходит для процедурных и функциональных языков. Варианты: if/elseif/else, switch/case или pattern matching.

```js
// Печатает поддерево, начиная с узла node
function print(node) {
  case node of {
    AddOperator => print(node.left) + '+' + print(node.right)
    NotOperator => '!' + print(node)
    Variable    => print(variables.get(node.name).value)
    Literal     => print(node.value)
  }
}

// Вычисляет значение, начиная с узла node
function eval(node) {
  case node of {
    AddOperator => return eval(node.left) + eval(node.right)
    NotOperator => return !eval(node)
    Variable    => return variables.get(node.name).value
    Literal     => return node.value
  }
}
```

### Решение 2: полиморфные методы

Подходит для объектно-ориентированных и некоторых функциональных языков. В языке должно быть наследование либо утиная типизация, а также иерархия классов.

```js
class AddOperator extends Node {
  let left: Node = null
  let right: Node = null

  function print() {
    left.print()
    print(' + ')
    right.print()
  }

  function eval() {
    return left.eval() + right.eval()
  }
}

class NotOperator extends Node {
  let child: Node = null

  function print() {
    print('!')
    child.print()
  }

  function eval() {
    return not child.eval()
  }
}
```

### Решение 3: Visitor (Посетитель)

Объектно-ориентированные языки не имеют встроенного решения, но зато есть паттерн проектирования Visitor (Посетитель).

- отношения классов и методов повёрнуты на 90°: новые операции становятся классами, тип данных с точки зрения операции (PrintVisitor, EvaluationVisitor) определяется методами (visitAddOperator, visitNotOperator или просто перегруженный/шаблонный visit)

Реализовать паттер Visitor в C++ можно с помощью полиморфизма (virtual-методы и классы) или с помощью шаблонов (Curiously recurring template pattern).

Реализация на виртуальных методах:

```cpp
struct VaribleAst;
struct LiteralAst;

struct IVisitor
{
    virtual ~IVisitor() = default;
    virtual void visit(VaribleAst &ast) = 0;
    virtual void visit(LiteralAst &ast) = 0;
};

struct IExpressionAst
{
    virtual ~IExpressionAst() = default;
    virtual void accept(IVisitor &visitor) = 0;
}

struct VariableAst : IExpressionAst
{
    void accept(IVisitor &visitor) override {
        visitor.visit(*this);
    }
}

struct LiteralAst : IExpressionAst
{
    void accept(IVisitor &visitor) override {
        visitor.visit(*this);
    }
}
```

Реализация на CRTP (Curiously recurring template pattern), которую не рекомендуется использовать из-за бесмыссленной сложности:

- [шаблоны Visitor и Visitable](https://gist.github.com/matovitch/5dfdac845b159b6a0a8e)
- [пример использования](https://gist.github.com/matovitch/3dad7e9092dec9427c79)

Объектно-ориентированный подход не снимает Expression Problem, но позволяет выбирать, что будет простым: добавление новых типов данных или новых операций

- если AST создан без паттерна Visitor (решение №2), проще будет добавлять новые типы данных;
- если AST создан с паттерном Visitor (решение №3), проще будет добавлять новые операции

### Решение 4: Обход дерева и case-распознавание

Псевдокод:

```js
function (this *EvaluationVisitor) visit(node) {
  case node of:
    AddOperator => print(node.left) + '+' + print(node.right)
    NotOperator => '!' + print(node)
}

function eval(ast) {
  var visitor EvaluationVisitor
  ast.walk(visitor)
}
```

- Решение хорошо работает в языках с поддержкой ООП и pattern matching, таких как Golang.
- [Пример для Golang (github.com)](https://github.com/sergey-shambir/gosemki/blob/master/src/gosemki/CallExprVisitor.go)
- В C++ 2011 можно сделать pattern matching на уровне библиотеки: [библиотека Mach7 (github.com)](https://github.com/solodon4/Mach7)

### Проблема рекурсии заголовочных файлов и её решение

В примерах ниже виртуальный деструктор, спецификаторы доступа public/private и другие детили опущены.

Допустим, в `AST.h` объявлен класс `CNode`:

```cpp
class CNode
{
    virtual void accept(CVisitor & v) { v.visit(*this); }
}
```

В `Visitor.h` объявлен класс `CVisitor`:

```cpp
class CVisitor
{
    virtual void visit(StringElement & e) {}
    virtual void visit(RealElement & e) {}
    virtual void visit(IntegerElement & e) {}
}
```

В итоге в `Visitor.h` нужна информация из `AST.h`, и наоборот. Решения проблемы:

- использовать forward declaration для классов
- разделять объявление и определение методов (объявление в h, определение в cpp)
- разделять интерфейсы, абстрактные классы, конкретные классы

```cpp
// Предварительное объявление класса (интерфейса) посетителя.
class CVisitor;

// Объявление/определение класса узла AST.
class CNode
{
    // В параметрах метода упомянут класс CVisitor.
    // мы можем хранить указатель на CVisitor, т.к. размер указателя не зависит от его типа.
    // мы можем хранить ссылку, т.к. ссылки в C++ реализованы через указатель.
    // но нельзя прямо здесь создавать, удалять, копировать CVisitor или вызывать его методы.
    virtual void accept(CVisitor & v) = 0;
};
```

### Как создавать узлы AST

Выбирайте баланс между увеличением иерархии классов и Case-распознаванием. Например, часто заводят единый класс на все бинарные операции:

```cpp
enum class BinaryOperation
{
    Add,
    Multiply,
    // ...
}

class CBinaryExpression : CExpression
{
    BinaryOperation kind;
    CExpression *left;
    CExpression *right;
}
```

Надо учесть, что есть инструкции с произвольной арностью (то есть произвольным количеством операндов). Пример — вызов функции:

```cpp
class CCallExpression : CExpression
{
    CIdentifier name;
    std::vector<CExpression*> arguments;
}
```

К бинарным операциям можно отнести также взятие элемента по индексу, оператор "точка", присвоение и другие специальные операции

Не стоит перегружать новый язык программирования поддержкой всех бинарных операций языка C — некоторые редко используемые можно заменить на вызовы функций или вообще убрать. Яркий пример — побитовые операции.

Для решения нетривиальных задач можно изучать существующие библиотеки для разбора промышленных языков программирования: [clang AST](http://clang.llvm.org/docs/IntroductionToTheClangAST.html), [пакет go/ast в Golang](https://golang.org/pkg/go/ast/), [модуль ast в Python](https://docs.python.org/2/library/ast.html).
