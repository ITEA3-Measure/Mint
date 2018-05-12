#!/bin/bash

for i in {2..15}
do
	echo "Running length $i"
	node model.js $i > results.$i
done
