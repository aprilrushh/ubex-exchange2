#!/bin/bash
echo "==== UBEX Exchange Error Report ====" > error-report.log
echo "Date: $(date)" >> error-report.log
echo "Node Version: $(node -v)" >> error-report.log
echo "NPM Version: $(npm -v)" >> error-report.log
echo "" >> error-report.log

echo "==== Installed Packages ====" >> error-report.log
npm list --depth=0 >> error-report.log
echo "" >> error-report.log

echo "==== Server Log with Debug ====" >> error-report.log
NODE_DEBUG=* node server.js >> error-report.log 2>&1 &
PID=$!
sleep 5
kill $PID

echo "==== Missing Files Check ====" >> error-report.log
FILES=(
  "server.js"
  "backend/services/ExchangeService.js"
  "backend/services/walletService.js"
  "backend/services/marketDataService.js"
  "backend/services/blockchainService.js"
  "backend/services/securityService.js"
  "backend/services/websocketService.js"
  "backend/routes/authRoutes.js"
  "backend/controllers/authController.js"
  "backend/middlewares/authMiddleware.js"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "✓ $FILE exists" >> error-report.log
  else
    echo "✗ $FILE is missing" >> error-report.log
  fi
done

echo "" >> error-report.log
echo "Error report generated: error-report.log"
