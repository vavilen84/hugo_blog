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
- already processed vertices should be added to "processed" map, so we don't move twice throw the one vertex

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

# Bubble sort

Wikipedia: https://en.wikipedia.org/wiki/Bubble_sort

Author code: https://github.com/vavilen84/algo/blob/master/bubble_sort/bubble_sort.go

Current implementation is a little different from more frequent "double for" implementation - here we use recursion. Main idea of algorithm:
- move from beginning of set to the end iteratively
- each iteration should compare/swap two digits until all set is sorted

```
package bubble_sort

func SortRecursive(input []int, i int, shifted bool, preLastIndex, iterationsCount int) ([]int, int) {
	iterationsCount++ // sort iterations count
	if i == 0 {
		shifted = false // reset shifted flag for each index reset
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
			// if there wes no shift and last two digits are sorted - so we return result
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

Author code: https://github.com/vavilen84/algo/blob/master/dijkstra_algo/main.go

This algorithm is used to find a shortest path for a weighted graph. 

Main idea is:
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

Author code: https://github.com/vavilen84/algo/blob/master/merge_sort/main.go

Main idea is:
- recursively divide input slice (merge will start with 1 int slices, then - slices will grow)
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

