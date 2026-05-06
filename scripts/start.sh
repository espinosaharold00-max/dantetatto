#!/bin/sh
set -e

echo "=== [deploy] Sincronizando esquema de base de datos ==="
node node_modules/prisma/build/index.js db push --skip-generate
echo "=== [deploy] Tablas sincronizadas ==="

echo "=== [deploy] Ejecutando seed (datos iniciales) ==="
node scripts/seed.mjs || echo "[deploy] Seed ya ejecutado o sin cambios"

echo "=== [deploy] Iniciando servidor ==="
exec node server.js
