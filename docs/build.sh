#!/usr/bin/bash

SCRIPT_NAME=$(basename "$0")

CURRENT_PID=$$

OTHER_PIDS=$(pgrep -f "$SCRIPT_NAME" | grep -v "^$CURRENT_PID$")

if [ -n "$OTHER_PIDS" ]; then
    for PID in $OTHER_PIDS; do
        if ps -p "$PID" > /dev/null ; then
            pkill -9 "$PID" 2>/dev/null
        fi
    done
fi

pdflatex -interaction nonstopmode -shell-escape main.tex
biber main
pdflatex -interaction nonstopmode -shell-escape main.tex
pdflatex -interaction nonstopmode -shell-escape main.tex
