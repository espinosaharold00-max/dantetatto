#!/bin/sh
set -e

echo "=== [deploy] Inicializando base de datos ==="
node scripts/init-db.mjs

echo "=== [deploy] Ejecutando seed ==="
node scripts/seed.mjs || echo "[deploy] Seed completado"

echo "=== [deploy] Iniciando servidor ==="
exec node server.js
