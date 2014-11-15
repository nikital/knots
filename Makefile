TSC = tsc

ROPE_FILES = $(shell find game/rope -type f -iname '*.ts')
DEF_FILES = $(shell find game/defs -type f -iname '*.ts')

public/js/rope.js: game/rope/rope.ts $(ROPE_FILES) $(DEF_FILES)
	$(TSC) --out $@ $<
