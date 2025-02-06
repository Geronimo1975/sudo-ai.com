#!/bin/bash

function check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

function stop_servers() {
    echo "Stopping existing servers..."
    sudo lsof -t -i:8899 | xargs -r sudo kill -9
    sudo lsof -t -i:5000 | xargs -r sudo kill -9
    sleep 2
}

function start_servers() {
    echo "Starting FastAPI server..."
    python3 -m uvicorn ai_call_agent.main:app --reload --host 0.0.0.0 --port 8899 &
    
    echo "Starting static file server..."
    cd /home/dci-student/WEBSITE/sudo-ai.com
    python3 -m http.server 5000 &
}

case "$1" in
    start)
        stop_servers
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    restart)
        stop_servers
        start_servers
        ;;
    status)
        if check_port 8899; then
            echo "FastAPI server is running"
        else
            echo "FastAPI server is not running"
        fi
        if check_port 5000; then
            echo "Static file server is running"
        else
            echo "Static file server is not running"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
