#!/bin/bash

echo "Opresc procesele existente..."
pkill -f uvicorn
pkill -f python3

echo "Setez permisiunile..."
sudo chown -R $USER:$USER /home/dci-student/WEBSITE/sudo-ai.com
sudo chmod -R 755 /home/dci-student/WEBSITE/sudo-ai.com
sudo chmod -R 777 /home/dci-student/WEBSITE/sudo-ai.com/static/audio

echo "Setez variabilele de mediu..."
export PYTHONPATH=/home/dci-student/WEBSITE/sudo-ai.com

echo "Pornesc serverul..."
python3 -m uvicorn ai_call_agent.main:app --reload --host 0.0.0.0 --port 8899 --log-level debug
