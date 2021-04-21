---
title: "Алгоритмы в Golang"
publishdate: "2021-03-05"
lastmod: "2021-03-05"
summary: "go"
description: "Эта статья основана на книге Aditya Bhargava 'Grokking Algorithms'. Cтатья может быть полезна при подготовке к собеседованию."
image: "posts/dynamical_programming_subsequent.png"
categories:
  - "algorithms"
tags:
  - "algorithms"
  - "book notes"
---

Эта статья основана на книге Aditya Bhargava "Grokking Algorithms". Cтатья может быть полезна при подготовке к собеседованию.

Код книги: https://github.com/egonSchiele/grokking_algorithms

Код автора: https://github.com/vavilen84/algo

Что такое сложность алгоритма: https://en.wikipedia.org/wiki/Time_complexity . Информация о сложности алгоритмов в этой статье была взята из разных источников, поетому автор просит дополнительно проверять эту информацию.

# Бинарный поиск

Википедия: https://en.wikipedia.org/wiki/Binary_search_algorithm

Код автора: https://github.com/vavilen84/algo/blob/master/binary_search/binary_search.go

Сложность алгоритма: худшее время - логарифмическое O(log n); лучшее - константное O(1) 


Алгоритм будет работать только с отсортированными массивами. Идея заключается:
- разделить набор данных на две части
- сравнить поиск с первым (последним) элементом блока данных
- выбрать правильный блок
- разделить выбранный блок на две части
- и т. д. до тех пор, пока мы не получим правильное значение

```
package binary_search

import "sort"

func SearchInIntSlice(haystack []int, needle int) (result bool, iterationsCount int) {
	sort.Ints(haystack) 
	lowKey := 0 // первый индекс
	highKey := len(haystack) - 1 // последний индекс
	if (haystack[lowKey] > needle) || (haystack[highKey] < needle) {
		return // нужное значение не в диапазоне данных
	}
	for lowKey <= highKey { 
	    // уменьшаем список рекурсивно
		iterationsCount++
		mid := (lowKey + highKey) / 2 // середина
		if haystack[mid] == needle {
			result = true // мы нашли значение
			return
		}
		if haystack[mid] < needle { 
		    // если поиск больше середины - мы берем только блок с большими значениями увеличивая lowKey
			lowKey = mid + 1
			continue
		}
		if haystack[mid] > needle { 
		    // если поиск меньше середины - мы берем блок с меньшими значениями уменьшая highKey
			highKey = mid - 1
		}
	}
	return
}
```

# Поиск в ширину

Википедия: https://en.wikipedia.org/wiki/Breadth-first_search

Код автора: https://github.com/vavilen84/algo/blob/master/breadth_first_search/main.go

Сложность алгоритма: худшее время - O(V+E)

Код книги: https://github.com/egonSchiele/grokking_algorithms/blob/master/06_breadth-first_search/Golang/01_breadth-first_search.go

Поиск в ширину - это алгоритм для обхода или поиска структур данных в виде дерева или графа.

Например, наша цель - вычислить количество связей от начальной вершины до целевой. Наш граф:

```
a -- b -- c -- f
     |         |
     d -- i -- j
```
Представим, что нам нужно посчитать - сколько шагов нам нужно от «a» до «i» (3 шага: a -> b, b -> d, d -> i). Мы можем представить наш граф в Go как:
```
graph := map[string][]string{
    "a": {"b", "d"},
    "b": {"a", "c"},
    "c": {"b", "f", "j"},
    "d": {"a", "i"},
    "f": {"c"},
    "i": {"d", "j"},
    "j": {"c", "i"},
}
```

Основная идея состоит в том, чтобы рекурсивно перебирать и сравнивать все соседние вершины.

Наша реализация алгоритма состоит из одного рекурсивного метода. Этот метод должен:
- Увеличиваем счетчик
- перебираем соседей начальной вершины {"b", "d"}
- сравниваем - является ли сосед целью
- если да - возвращаем
- поскольку ни «b», ни «d» не являются целью - функция должна добавлять соседей «b» и «d» в очередь и рекурсивно вызывать себя, передавая в качестве аргумента «вершины» только что собранную очередь соседей
- вершины следующей итерации должны быть {"a", "c", "a", "i"}
- функция пропускает «а», потому что это наша начальная вершина (нам не нужно двигаться в обратном направлении)
- уже обработанные вершины тоже должны быть пропущены (добавлены в "обработанную" очередь, чтобы мы не перебирали дважды одну вершину)

```
package breadth_first_search

func runAlgo(graph map[string][]string, start, destination string) (result int) {
	processed := map[string]bool{}
	processVertexRecursive(start, graph[start], destination, &graph, &result, &processed)
	return
}

func processVertexRecursive(
	start string,
	vertices []string,
	destination string,
	graph *map[string][]string,
	result *int,
	processed *map[string]bool,
) {
	*result++ // счетчик итераций
	nextLevelVertices := make([]string, 0) // очередь для соседей
	for _, v := range vertices {
		if v == start {
			continue // не движемся в обратном направлении
		}
		if (*processed)[v] {
			continue // не перебираем одну вершину два раза
		}
		(*processed)[v] = true
		if v == destination {
			return // мы дошли до целевой вершины
		} else {
			nextLevelVertices = append(nextLevelVertices, (*graph)[v]...) // добавляем соседей в очередь
		}
	}

	// рекурсивно обрабатываем очередь соседей
	processVertexRecursive(start, nextLevelVertices, destination, graph, result, processed)
}
```

# Пузырьковый метод

Википедия: https://en.wikipedia.org/wiki/Bubble_sort

Код автора: https://github.com/vavilen84/algo/blob/master/bubble_sort/bubble_sort.go

Сложность алгоритма: худшее время - quadratic O(n2); лучшее - линейно-логарифмическое время O(n log n) или линейное O(n)

Идея заключается:
- итеративно перебираем весь набор
- каждая итерация должна сравнивать / менять местами две цифры, пока не будет отсортирован весь набор

```
package bubble_sort

func SortRecursive(input []int, i int, shifted bool, preLastIndex, iterationsCount int) ([]int, int) {
	iterationsCount++ // счетчик итераций
	if i == 0 {
		shifted = false // сбрасываем флаг shifted после сброса индекса
	}
	if input[i] > input[i+1] { // сравниваем два значения
		input[i], input[i+1] = input[i+1], input[i] // меняем значение если левое больше
		// обрабатываем предпоследний индекс
		if preLastIndex == i {
			// если не было обмена значениями - меняем последние 2 значения и возвращаем результат
			if shifted == false {
				return input, iterationsCount
			}
		}
		shifted = true
	} else {
		// обрабатываем предпоследний индекс
		if preLastIndex == i {
	        // если не было обмена значениями - меняем последние 2 значения и возвращаем результат
			if shifted == false {
				return input, iterationsCount
			}
		}
	}
	// обрабатываем предпоследний индекс независимо от того, был ли обмен значениями
	if preLastIndex == i {
		i = 0 // если предпоследний - сбрасываем индекс
	} else {
		i++
	}
	
	// рекурсивный вызов
	return SortRecursive(input, i, shifted, preLastIndex, iterationsCount)
}
```

# Алгоритм Дейкстры

Википедия: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

Код книги: https://github.com/egonSchiele/grokking_algorithms/blob/master/07_dijkstras_algorithm/Golang/01_dijkstras_algorithm.go

Код автора: https://github.com/vavilen84/algo/blob/master/dijkstra_algo/main.go

Сложность алгоритма: худшее - O(E + V log V)  

Этот алгоритм используется для поиска кратчайшего пути для взвешенного графа.

Идея заключается:
- каждая вершина должна иметь начальные значения результата как бесконечное целое число
- перебираем всех соседей начальной вершины
- пишем результирующий путь вершин соответственно ребрам, потому что каждое значение ребра меньше бесконечности
- помечаем «стартовую» вершину как «обработанную» (тогда алгоритм должен пропускать уже обработанные вершины)
- выбраем соседа с наименьшим результатом пути
- перебираем всех соседей (кроме «стартовых» и уже «обработанных» вершин)
- пишем новые значения результатов по принципу
```
if (edgeToNeighbour (путь к соседней вершине) + currentNodeWeight (значение текущей вершины) ) < neighbourResultValue (значение соседней вершины) {
 neighbourResultValue = (edgeToNeighbour + currentNodeWeight)
}
```
- отметить текущий узел как обработанный
- выбрать необработанного соседа с наименьшим значением результата
- так далее, пока не обойдем весь граф

# Сортировка слиянием

Википедия: https://en.wikipedia.org/wiki/Merge_sort

Код автора: https://github.com/vavilen84/algo/blob/master/merge_sort/main.go

Сложность алгоритма: линейно-логарифмическое время O(n log n) 

Идея заключается:
- рекурсивно разделить входной срез (слияние начнется со среза длинной в 1 элемент, затем срезы будут расти)
- объединяем с помощью сравнения по ключам

```
package merge_sort

func MergeSort(input []int) []int {
	l := len(input)
	if l == 1 {
		// валидация длинны
		return input
	}
	// разделяем набор на две части
	middleIdx := l / 2
	left := input[:middleIdx]
	right := input[middleIdx:]

	// рекурсивное слияние
	return Merge(MergeSort(left), MergeSort(right))
}

func Merge(left, right []int) []int {
	result := make([]int, len(left)+len(right))
	i := 0
	// создаем новый слайс путем сравнения по ключам
	for (len(left) > 0) && (len(right) > 0) {
		if left[0] < right[0] {
			result[i] = left[0]
			left = left[1:]
		} else {
			result[i] = right[0]
			right = right[1:]
		}
		i++
	}
	for j := 0; j < len(left); j++ {
		result[i] = left[j]
	}
	for j := 0; j < len(right); j++ {
		result[i] = right[j]
	}
	return result
}

```

# Быстрая сортировка

Википедия: https://en.wikipedia.org/wiki/Quicksort

Код автора: https://github.com/vavilen84/algo/blob/master/quick_sort/quick_sort.go

Код книги: https://github.com/egonSchiele/grokking_algorithms/blob/master/04_quicksort/golang/05_quicksort.go

Сложность алгоритма: худшее время - квадратичное O(n2); лучшее - линейно-логарифмическое время O(n log n)  

Идея заключается:
- взять первое значение как опорную точку
- перебирать остальные элементы
- разделить элементы на те, которые больше и те, которые меньше опорной точки
- рекурсивно отсортировать меньшие и большие элементы

```
package quick_sort

func Sort(input []int) []int {
	l := len(input)
	if l < 2 {
		return input
	}
	less := make([]int, 0)
	bigger := make([]int, 0)
	pivot := input[0]
	for _, v := range input[1:] {
		if v > pivot {
			bigger = append(bigger, v)
		} else {
			less = append(less, v)
		}
	}
	input = append(Sort(less), pivot)
	input = append(input, Sort(bigger)...)
	return input
}
```

# Сортировка выбором

Википедия: https://en.wikipedia.org/wiki/Selection_sort

Код автора: https://github.com/vavilen84/algo/blob/master/selection_sort/selection_sort.go

Код книги: https://github.com/egonSchiele/grokking_algorithms/blob/master/02_selection_sort/Golang/01_selection_sort.go

Сложность алгоритма: квадратичное O(n2)

Идея заключается:
- интеративно перебираем входящий срез
- каждая итерация должна: 1) найти наименьшее целое число 2) поместить его в новый набор результатов 3) уменьшить входной срез 

```
package selection_sort

// паника - если входной срез пустой
func FindSmallestValuePosition(input []int) int {
	smallestValuePosition := 0
	smallestValue := input[smallestValuePosition]
	for k, v := range input {
		if v < smallestValue {
			smallestValue = v
			smallestValuePosition = k
		}
	}
	return smallestValuePosition
}

func Sort(input []int) []int {
	l := len(input)
	if l == 0 {
		return input
	}
	sorted := make([]int, l)
	for i := 0; i < l; i++ {
		p := FindSmallestValuePosition(input)
		sorted[i] = input[p]
		input = append(input[:p], input[p+1:]...)
	}
	return sorted
}
```

# Динамическое программирование

Википедия: https://en.wikipedia.org/wiki/Dynamic_programming

Код книги: https://github.com/egonSchiele/grokking_algorithms/blob/master/09_dynamic_programming/golang/01_longest_common_subsequence.go

Пример - поиск самой длинной подстроки, содержащейся в двух словах.

Основная идея - разделить задачу на подзадачи и решить каждую подзадачу только один раз:
- строим матрицу
- сравниваем посимвольно используя вложенный цикл

Если нам нужно найти подстроку, то решение должно выглядеть так:

![](/posts/dynamical_programming_substring.png)

```
if word_a[i] == word_b[j]: 
 cell[i][j] = cell[i-1][j-1] + 1
else:
 cell[i][j] = 0
```

Если нам нужно найти общее количество сходных символов, то решение должно выглядеть так:


![](/posts/dynamical_programming_subsequent.png)

```
if word_a[i] == word_b[j]: 
 cell[i][j] = cell[i-1][j-1] + 1 
    cell[i][j] = cell[i-1][j]
    if cell[i][j] < cell[i][j-1]:
        cell[i][j] = cell[i][j-1]
```

Конец статьи.
