#!/bin/bash
for file in whl/*.whl;
do
    echo "Installing $file"
    pip install $file
done