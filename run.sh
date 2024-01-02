#!/bin/bash

cd backend
source ./venv/bin/activate
python3 ./manage.py runserver

# Cleanup
deactivate
cd ../
