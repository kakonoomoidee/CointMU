# ==========================================
# CointMU Desktop Client
# ==========================================

VERSION = 1
PATCHLEVEL = 2
SUBLEVEL = 0
EXTRAVERSION = tvrstsp

.PHONY: help dev build\:win clean

help:
	@echo "=========================================="
	@echo "  CointMU Desktop Makefile Help           "
	@echo "=========================================="
	@echo "  dev        - Start development server"
	@echo "  build:win  - Build Windows executable"
	@echo "  clean      - Clean build artifacts"
	@echo "  help       - Print this help message"
	@echo "=========================================="

dev:
	npm run dev

build\:win:
	npm run build:win

clean:
	rm -rf out dist build
