---
title: "Algorithms in Golang"
publishdate: "2021-03-05"
lastmod: "2021-03-05"
summary: "algorithms"
description: "The article is based on Aditya Bhargava 'Grokking Algorithms' book. The article could be helpful during preparation for an interview."
image: "posts/dynamical_programming_subsequent.png"
categories:
  - "algorithms"
tags:
  - "algorithms"
  - "book notes"
---

This article is based on Aditya Bhargava "Grokking Algorithms" book. Article could be helpful during preparation for an interview. 

Book code: https://github.com/egonSchiele/grokking_algorithms

Author`s code: https://github.com/vavilen84/algo

What time complexity is: https://en.wikipedia.org/wiki/Time_complexity . Information about time complexity of algorithms described in this article was taken from different resources, so the author asks to double check this information.

# Binary search

Wikipedia: https://en.wikipedia.org/wiki/Binary_search_algorithm

Author`s code: https://github.com/vavilen84/algo/blob/master/binary_search/binary_search.go

Time complexity: worst - logarithmic O(log n); best - constant O(1) 

The algorithm is going to work only with sorted arrays. The main idea is:
- divide dataset in two pieces
- compare needle with first(last) element of data set piece
- choose correct piece
- divide selected piece in two pieces
- etc... until we have correct value

```
package binary_search

import "sort"

func SearchInIntSlice(haystack []int, needle int) (result bool, iterationsCount int) {
	sort.Ints(haystack) // this algorithm is not going to work with unsorted list
	lowKey := 0 // first index
	highKey := len(haystack) - 1 // last index
	if (haystack[lowKey] > needle) || (haystack[highKey] < needle) {
		return // target value is not in the range
	}
	for lowKey <= highKey { 
	    // reduce list iteratively
		iterationsCount++
		mid := (lowKey + highKey) / 2 // middle index
		if haystack[mid] == needle {
			result = true // we found our value
			return
		}
		if haystack[mid] < needle { 
		    // if needle is bigger than middle - we only take a part with highest values by increasing lowKey
			lowKey = mid + 1
			continue
		}
		if haystack[mid] > needle { 
		    // if needle is smaller than middle - we only take a part with lowest values by decreasing highKey
			highKey = mid - 1
		}
	}
	return
}
```

# Breadth-first search

Wikipedia: https://en.wikipedia.org/wiki/Breadth-first_search

Author`s code: https://github.com/vavilen84/algo/blob/master/breadth_first_search/main.go

Time complexity: worst - O(V+E)

Book code: https://github.com/egonSchiele/grokking_algorithms/blob/master/06_breadth-first_search/Golang/01_breadth-first_search.go

Breadth-first search is an algorithm for traversing or searching tree or graph data structures. 

For example, our goal is to calculate the number of interactions (graph edges) from start vertex to destination. Our example graph is

```
a -- b -- c -- f
     |         |
     d -- i -- j
```
Let's imagine, that we need to calculate - how many steps we need from "a" to "i" (3 steps a -> b, b -> d, d -> i). We can represent our graph in Go like
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

The main idea is to iterate and compare over all vertices neighbours recursively.

Our algorithm implementation consists of one recursive method. This method should:
- Increase steps counter (steps calculation)
- iterate over "start" vertex neighbours {"b", "d"}
- compare if neighbour is the target
- if so - function should call return
- since neither "b" nor "d" are not the target - function should add "b" & "d" neighbours to queue and recursively call itself passing as "vertices" argument just collected neighbours queue
- next iteration vertices should be {"a", "c", "a", "i"}
- function skips "a" because it is our start vertex (we don't need to move in the opposite direction)
- already processed vertices should be skipped also (added to "processed" map, so we don't move twice throw the one vertex)

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
	*result++ // iterations counter
	nextLevelVertices := make([]string, 0) // queue for neighbours
	for _, v := range vertices {
		if v == start {
			continue // dont move in opposite direction
		}
		if (*processed)[v] {
			continue // optimization - dont move twice throw the one vertex
		}
		(*processed)[v] = true
		if v == destination {
			return // we found destination
		} else {
			nextLevelVertices = append(nextLevelVertices, (*graph)[v]...) // add all neighbours to queue
		}
	}

	// process neighbours queue recursively
	processVertexRecursive(start, nextLevelVertices, destination, graph, result, processed)
}
```

# Bubble sort

Wikipedia: https://en.wikipedia.org/wiki/Bubble_sort

Author`s code: https://github.com/vavilen84/algo/blob/master/bubble_sort/bubble_sort.go

Time complexity: worst - quadratic O(n2); best - linearithmic O(n log n) or O(n)

The main idea is:
- move from beginning of set to the end iteratively
- each iteration should compare/swap two digits until all set is sorted

```
package bubble_sort

func SortRecursive(input []int, i int, shifted bool, preLastIndex, iterationsCount int) ([]int, int) {
	iterationsCount++ // iterations counter
	if i == 0 {
		shifted = false // reset shifted flag after each index reset
	}
	if input[i] > input[i+1] { // compare two values
		input[i], input[i+1] = input[i+1], input[i] // swap values if left is bigger
		// handle pre-last index
		if preLastIndex == i {
			// if there was no shift except last 2 digits - so we change last two values and return result
			if shifted == false {
				return input, iterationsCount
			}
		}
		shifted = true
	} else {
		// handle pre-last index
		if preLastIndex == i {
			// if there was no shift and last two digits are sorted - so we return result
			if shifted == false {
				return input, iterationsCount
			}
		}
	}
	// handle pre-last index for both cases (shift/no shift)
	if preLastIndex == i {
		i = 0 // if pre-last index - reset index counter
	} else {
		i++
	}
	return SortRecursive(input, i, shifted, preLastIndex, iterationsCount)
}
```

# Dijkstra algorithm

Wikipedia: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

Book code: https://github.com/egonSchiele/grokking_algorithms/blob/master/07_dijkstras_algorithm/Golang/01_dijkstras_algorithm.go

Author`s code: https://github.com/vavilen84/algo/blob/master/dijkstra_algo/main.go

Time complexity: worst - O(E + V log V)  

This algorithm is used to find the shortest path for a weighted graph. 

The main idea is:
- each vertex should have initial result values as infinity integer 
- iterate over all "start" node vertex neighbours
- set vertices result path accordingly to edges, because each edge value is lower than infinity
- mark "start" vertex as "processed" (then, algorithm should skip already processed vertices)
- choose neighbour with the lowest result path 
- iterate over all neighbours (except "start" and already "processed" vertices)
- set new result values by principle
```
if (edgeToNeighbour + currentNodeWeight) < neighbourResultValue {
 neighbourResultValue = (edgeToNeighbour + currentNodeWeight)
}
```
- mark current node as processed
- choose not processed neighbour with the lowest result value 
- etc... 

until all graph nodes are visited.

# Merge sort

Wikipedia: https://en.wikipedia.org/wiki/Merge_sort

Author`s code: https://github.com/vavilen84/algo/blob/master/merge_sort/main.go

Time complexity: linearithmic O(n log n) 

The main idea is:
- divide input slice recursively (merge will start with 1 int slices, then - slices will grow)
- merge using key-by-key comparison

```
package merge_sort

func MergeSort(input []int) []int {
	l := len(input)
	if l == 1 {
		// length validation
		return input
	}
	// divide slice into 2 pieces
	middleIdx := l / 2
	left := input[:middleIdx]
	right := input[middleIdx:]

	// recursive merge
	return Merge(MergeSort(left), MergeSort(right))
}

func Merge(left, right []int) []int {
	result := make([]int, len(left)+len(right))
	i := 0
	// create new slice using key-by-key comparison left & right slices
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

# Quick sort

Wikipedia: https://en.wikipedia.org/wiki/Quicksort

Author`s code: https://github.com/vavilen84/algo/blob/master/quick_sort/quick_sort.go

Book code: https://github.com/egonSchiele/grokking_algorithms/blob/master/04_quicksort/golang/05_quicksort.go

Time complexity: worst - quadratic O(n2); best - linearithmic O(n log n)  

The main idea is:
- take first int as pivot
- iterate over rest elements
- separate elements which are lower than pivot and which are bigger
- recursively sort lower elements, add pivot, add recursively sorted elements which are bigger

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

# Selection sort

Selection sort: https://en.wikipedia.org/wiki/Selection_sort

Author`s code: https://github.com/vavilen84/algo/blob/master/selection_sort/selection_sort.go

Book code: https://github.com/egonSchiele/grokking_algorithms/blob/master/02_selection_sort/Golang/01_selection_sort.go

Time complexity: quadratic O(n2)

The main idea is:
- iterate input
- each iteration should: 1) find smallest integer 2) put it in new result set 3) decrease input  

```
package selection_sort

// panics if input has zero length
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

# Dynamic programming

Wikipedia: https://en.wikipedia.org/wiki/Dynamic_programming

Book code: https://github.com/egonSchiele/grokking_algorithms/blob/master/09_dynamic_programming/golang/01_longest_common_subsequence.go

Example - finding the longest substring (subsequent) included in  two words.

The main idea is to divide the main problem into sub-problems and solve each sub-problem only once:
- build 2d matrix
- compare symbol by symbol using nested loop

If we need to find a substring, then solution should look like:

![](/posts/dynamical_programming_substring.png)

```
if word_a[i] == word_b[j]: 
 cell[i][j] = cell[i-1][j-1] + 1
else:
 cell[i][j] = 0
```


If we need to find a subsequent, then solution should look like:


![](/posts/dynamical_programming_subsequent.png)

```
if word_a[i] == word_b[j]: 
 cell[i][j] = cell[i-1][j-1] + 1 
    cell[i][j] = cell[i-1][j]
    if cell[i][j] < cell[i][j-1]:
        cell[i][j] = cell[i][j-1]
```

The end of the article.
