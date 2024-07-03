#!/bin/bash
poetry shell
pip install --upgrade pip
for file in whl/*.whl;
do
    if [[ ! -e $file ]]; then continue; fi
    echo "Installing $file"
    pip install $file
done