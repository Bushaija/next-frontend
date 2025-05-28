#!/bin/bash
pnpm run dev &
node watcher.ts
wait
