#!/bin/bash

for i in {2..15}
do
	echo $i
	tail -n 3 results.$i
done
