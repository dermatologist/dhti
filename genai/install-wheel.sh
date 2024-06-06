for file in ../genai/whl/*.whl;
do
    echo "Installing $file"
    pip install $file
done