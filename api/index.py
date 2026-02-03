from fastapi import FastAPI
import sys
import os

# Add the project root to sys.path so we can import packages (like backend)
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)

# Now we can import the app from backend.main
from backend.main import app

# Vercel needs the 'app' object to be available at the top level
