#!/bin/bash
set -e

echo "==> Installing pnpm globally..."
npm install -g pnpm@10.4.1

echo "==> Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

echo "==> Building application..."
pnpm build

echo "==> Build completed successfully!"
