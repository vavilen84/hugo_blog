package main

import (
	"fmt"
	"math/rand"
	"strconv"
	"sync"
	"time"
)

type Cowboys struct {
	Cowboys []Cowboy
}

type Cowboy struct {
	Id     int
	Name   string
	Health int
}

var cowboys Cowboys
var cowboysList = []Cowboy{
	{
		Id:     1,
		Name:   "Johnny",
		Health: 100,
	},
	{
		Id:     2,
		Name:   "Billy",
		Health: 100,
	},
	{
		Id:     3,
		Name:   "Bobby",
		Health: 100,
	},
}

func getCowboyToPunch(cowboy Cowboy) *Cowboy {
	var aliveCowboysKeys []int
	for key, v := range cowboys.Cowboys {
		if v.Id != cowboy.Id && v.Health > 0 {
			aliveCowboysKeys = append(aliveCowboysKeys, key)
		}
	}
	if len(aliveCowboysKeys) == 0 {
		panic("No alive cowboys found")
	}
	aliveCowboysKeys = shuffle(aliveCowboysKeys)
	return &cowboys.Cowboys[aliveCowboysKeys[0]]
}

func getIsCowboyLast(cowboy Cowboy) bool {
	for _, v := range cowboys.Cowboys {
		if v.Id != cowboy.Id && v.Health > 0 {
			return false
		}
	}
	return true
}

func fight(cowboy Cowboy, wg *sync.WaitGroup) {
	for {
		fmt.Println(cowboy.Name + " is ready to fight")
		isLast := getIsCowboyLast(cowboy)
		if isLast {
			fmt.Println(cowboy.Name + " is the last")
			wg.Done()
			break
		}
		cowboyPtr := getCowboyToPunch(cowboy)
		if cowboyPtr == nil {
			fmt.Println("Cannot find cowboy to punch")
			wg.Done()
			break
		}
		fmt.Println(cowboy.Name + " is going to hit " + cowboyPtr.Name)
		damage := rand.Intn(10)
		cowboyPtr.Health -= damage
		fmt.Println(cowboyPtr.Name + "`s health now is " + strconv.Itoa(cowboyPtr.Health))
		if cowboyPtr.Health < 0 {
			fmt.Println(cowboyPtr.Name + "is dead")
		}
		time.Sleep(1 * time.Millisecond)
	}
}

func main() {
	cowboys.Cowboys = cowboysList
	var wg sync.WaitGroup
	wg.Add(len(cowboysList))
	for _, cowboy := range cowboysList {
		go fight(cowboy, &wg)
	}

	wg.Wait()
}

func shuffle(vals []int) []int {
	r := rand.New(rand.NewSource(time.Now().Unix()))
	ret := make([]int, len(vals))
	n := len(vals)
	for i := 0; i < n; i++ {
		randIndex := r.Intn(len(vals))
		ret[i] = vals[randIndex]
		vals = append(vals[:randIndex], vals[randIndex+1:]...)
	}
	return ret
}
