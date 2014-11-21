TSC = tsc

KNOTS_FILES = $(shell find game/knots -type f -iname '*.ts')
ROPE_FILES = $(shell find game/rope -type f -iname '*.ts')
DEF_FILES = $(shell find game/defs -type f -iname '*.ts')

.PHONY: all
all: public/js/knots.js public/js/rope.js

public/js/knots.js: game/knots/knots.ts $(KNOTS_FILES) $(DEF_FILES)
	$(TSC) --out $@ $<

public/js/rope.js: game/rope/rope.ts $(ROPE_FILES) $(DEF_FILES)
	$(TSC) --out $@ $<
