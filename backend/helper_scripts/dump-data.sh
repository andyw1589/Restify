#!/bin/bash
cd ~/Desktop/csc309-P3/P3/backend/
python3 manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 > db.json