FROM python:3.11-slim


COPY . /app
WORKDIR /app


RUN  pip install poetry && \
  poetry config virtualenvs.create false && \
  poetry install --no-interaction --no-ansi --only main

# RUN for file in $(ls whl); do pip install whl/$file; done


CMD python app/server.py