#!/usr/bin/env bash
# exit on error
set -o errexit

# Build frontend
echo "Building frontend..."
cd inventory-frontend
npm install
npm run build
cd ..

# Prepare backend
echo "Preparing backend..."
# The dependencies should be installed by Render automatically if the root is set correctly,
# but if pushing from root, we might need to point to inventory_backend/requirements.txt
# For a monolithic deploy, it's safer to install them here if needed.
pip install -r inventory_backend/requirements.txt

# Run migrations
echo "Running migrations..."
python inventory_backend/manage.py migrate

# Collect static files
echo "Collecting static files..."
python inventory_backend/manage.py collectstatic --no-input
