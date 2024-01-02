#!/bin/bash
cd ~/Desktop/csc309-P3/P3/backend/

# Setting up venv
python3 -m venv ./venv
source ./venv/bin/activate
pip install -r ../requirements.txt

# Load filler data here
rm ./db.sqlite3
python3 ./manage.py makemigrations
python3 ./manage.py migrate
python3 ./manage.py loaddata db.json

# Cleanup
deactivate
cd ../
