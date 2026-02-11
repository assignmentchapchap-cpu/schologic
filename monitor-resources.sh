#!/bin/bash
# Resource monitoring script for dev server

echo "=== Starting Resource Monitor ==="
echo "Press Ctrl+C to stop"
echo ""

LOGFILE="resource-monitor-$(date +%Y%m%d-%H%M%S).log"
echo "Logging to: $LOGFILE"
echo ""

while true; do
    clear
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    
    echo "=== $TIMESTAMP ===" | tee -a "$LOGFILE"
    echo "" | tee -a "$LOGFILE"
    
    echo "--- Memory Usage ---" | tee -a "$LOGFILE"
    free -h | tee -a "$LOGFILE"
    echo "" | tee -a "$LOGFILE"
    
    echo "--- Top Node Processes ---" | tee -a "$LOGFILE"
    ps aux | grep -E "(node|Next|pnpm)" | grep -v grep | sort -k4 -r | head -10 | \
        awk '{printf "PID: %-7s CPU: %-6s MEM: %-6s COMMAND: %s\n", $2, $3"%", $4"%", $11}' | tee -a "$LOGFILE"
    echo "" | tee -a "$LOGFILE"
    
    echo "--- Next.js Cache Size ---" | tee -a "$LOGFILE"
    du -sh apps/portal/.next 2>/dev/null | tee -a "$LOGFILE"
    echo "" | tee -a "$LOGFILE"
    
    echo "Press Ctrl+C to stop..." | tee -a "$LOGFILE"
    echo "================================" | tee -a "$LOGFILE"
    echo "" | tee -a "$LOGFILE"
    
    sleep 5
done
