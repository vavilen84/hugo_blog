---
title: "Algorithms in Golang"
publishdate: "2021-01-30"
lastmod: "2021-01-30"
categories:
- "golang"
  tags:
- "algorithms"
- "book notes"
---

This article based on Aditya Bhargava "Grokking Algorithms" book. This article could be helpful during preparation to an interview.

Book code: https://github.com/egonSchiele/grokking_algorithms

Author code: https://github.com/vavilen84/algo

What time complexity is: https://en.wikipedia.org/wiki/Time_complexity

# Binary search

Wikipedia: https://en.wikipedia.org/wiki/Binary_search_algorithm

Author code: https://github.com/vavilen84/algo/blob/master/binary_search/binary_search.go

The algoritm is going to work only with sorted array. The main idea is:
- divide dataset in two pieces
- compare needle with first(last) element of data set piece
- choose correct piece
- divide this piece in two pieces
- etc... until we have correct value

time complexity is logarithmic - O(log n)

```
package binary_search

import "sort"

func SearchInIntSlice(haystack []int, needle int) (result bool, iterationsCount int) {
	sort.Ints(haystack) // this algorithm will not work with not sorted list

	lowKey := 0                  // first index
	highKey := len(haystack) - 1 // last index

	if (haystack[lowKey] > needle) || (haystack[highKey] < needle) {
		return // target value is not in the range
	}

	for lowKey <= highKey { // iteratively reduce list

		iterationsCount++

		mid := (lowKey + highKey) / 2 // middle index

		if haystack[mid] == needle {
			result = true // we found our value
			return
		}
		if haystack[mid] < needle { // if needle is bigger than middle - we take only part with highest values by increasing lowKey
			lowKey = mid + 1
			continue
		}
		if haystack[mid] > needle { // if needle is smaller than middle - we take only part with lowest values by decreasing highKey
			highKey = mid - 1
		}
	}
	return
}
```

# Breadth-first search

Wikipedia: https://en.wikipedia.org/wiki/Breadth-first_search

Author code: https://github.com/vavilen84/algo/blob/master/breadth_first_search/main.go

Book code: https://github.com/egonSchiele/grokking_algorithms/blob/master/06_breadth-first_search/Golang/01_breadth-first_search.go

Breadth-first search is an algorithm for traversing or searching tree or graph data structures. 

For example, our goal is to calculate number of interactions (graph edges) from start vertex to destination. Our example graph is

```
a -- b -- c -- f
     |		   |
     d -- i -- j
```
Let`s imagine, that we need to calculate - how many steps we need from "a" to "i" (3 steps a -> b, b -> d, d -> i). We can represent our graph in Go like
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

Main idea of algorithm is to iterate and compare over all vertices neighbours recursively.

Our algorithm implementation consists of one recursive method. This method:
- Increase steps counter (as we need to calculate an amount of steps)
- iterate over "start" vertex neighbours {"b", "d"}
- compare if neighbour is target
- if so - function calls return
- since neither "b" nor "d" are not targets - function adds "b" & "d" neighbours to queue and recursively calls itself passing as "vertices" argument just collected neighbours queue.
- next iteration vertices should be {"a", "c", "a", "i"}
- function skips "a" because it is our start, and we don't need to move in the opposite direction
- function has optimization - already processed vertices should be added to "processed" map, so we don't move twice throw the one vertex

```
package breadth_first_search

func runAlgo(graph map[string][]string, start, destination string) (result int) {
	processed := map[string]bool{}
	processVertexRecursive(start, graph[start], destination, &graph, &result, &processed)
	return
}

func processVertexRecursive(start string, vertices []string, destination string, graph *map[string][]string, result *int, processed *map[string]bool) {
	*result++                              // recursive iterations counter
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
	processVertexRecursive(start, nextLevelVertices, destination, graph, result, processed) // process neighbours queue recursive
}
```