# Comprehensive Deno Makefile

# Variables
DENO = deno
MAIN_FILE = main.ts
TEST_FILES = **/*_test.ts
BENCH_FILES = **/*_bench.ts
COMPILE_FLAGS = --allow-read --allow-write
COMPILE_OUTPUT = myapp
DENO_DIR ?= .deno_cache

# OS-specific variables
COMPILE_OS_DARWIN = darwin
COMPILE_OS_LINUX = linux
COMPILE_OS_WINDOWS = windows
COMPILE_ARCH = x86_64

# Help
.PHONY: help
help:
	@echo "Comprehensive Deno Makefile"
	@echo "==========================="
	@echo
	@echo "Execution:"
	@echo "  make run [ARGS='']           : Run the main script"
	@echo "  make serve [ARGS='']         : Run a server"
	@echo "  make task TASK=<task_name>   : Run a task defined in deno.json"
	@echo "  make repl                    : Start Deno REPL"
	@echo "  make eval CODE='<code>'      : Evaluate JavaScript code"
	@echo
	@echo "Dependency Management:"
	@echo "  make add DEP='<dependency>'  : Add a dependency"
	@echo "  make remove DEP='<dependency>': Remove a dependency"
	@echo "  make install SCRIPT='<script>': Install a script as executable"
	@echo "  make uninstall SCRIPT='<script>': Uninstall a script"
	@echo
	@echo "Compilation:"
	@echo "  make compile [ARGS='']       : Compile for current OS"
	@echo "  make compile-mac [ARGS='']   : Compile for macOS"
	@echo "  make compile-linux [ARGS=''] : Compile for Linux"
	@echo "  make compile-windows [ARGS='']: Compile for Windows"
	@echo
	@echo "Testing and Benchmarking:"
	@echo "  make test [ARGS='']          : Run tests"
	@echo "  make bench [ARGS='']         : Run benchmarks"
	@echo "  make coverage [ARGS='']      : Generate coverage report"
	@echo
	@echo "Code Quality:"
	@echo "  make fmt [ARGS='']           : Format code"
	@echo "  make lint [ARGS='']          : Lint code"
	@echo "  make check [ARGS='']         : Type-check dependencies"
	@echo
	@echo "Documentation:"
	@echo "  make doc [ARGS='']           : Generate documentation"
	@echo
	@echo "Project Management:"
	@echo "  make init                    : Initialize a new project"
	@echo "  make info [FILE='']          : Show info about cache or file"
	@echo "  make clean                   : Clean cache and build artifacts"
	@echo "  make upgrade [VERSION='']    : Upgrade Deno"
	@echo
	@echo "Bundle and Publish:"
	@echo "  make bundle [ARGS='']        : Bundle module into single file"
	@echo "  make publish [ARGS='']       : Publish package"
	@echo
	@echo "Use ARGS='<flags>' to pass additional arguments to Deno commands"
	@echo "Example: make run ARGS='--allow-net'"

# Execution
.PHONY: run serve task repl eval

run:
	$(DENO) run $(ARGS) $(MAIN_FILE)

serve:
	$(DENO) serve $(ARGS) $(MAIN_FILE)

task:
	$(DENO) task $(TASK)

repl:
	$(DENO) repl $(ARGS)

eval:
	$(DENO) eval $(CODE)

# Dependency Management
.PHONY: add remove install uninstall

add:
	$(DENO) add $(DEP)

remove:
	$(DENO) remove $(DEP)

install:
	$(DENO) install $(ARGS) $(SCRIPT)

uninstall:
	$(DENO) uninstall $(SCRIPT)

# Compilation
.PHONY: compile compile-mac compile-linux compile-windows

compile:
	$(DENO) compile $(COMPILE_FLAGS) $(ARGS) -o $(COMPILE_OUTPUT) $(MAIN_FILE)

compile-mac:
	$(DENO) compile $(COMPILE_FLAGS) $(ARGS) --target $(COMPILE_OS_DARWIN)-$(COMPILE_ARCH) -o $(COMPILE_OUTPUT)-mac $(MAIN_FILE)

compile-linux:
	$(DENO) compile $(COMPILE_FLAGS) $(ARGS) --target $(COMPILE_OS_LINUX)-$(COMPILE_ARCH) -o $(COMPILE_OUTPUT)-linux $(MAIN_FILE)

compile-windows:
	$(DENO) compile $(COMPILE_FLAGS) $(ARGS) --target $(COMPILE_OS_WINDOWS)-$(COMPILE_ARCH) -o $(COMPILE_OUTPUT)-windows.exe $(MAIN_FILE)

# Testing and Benchmarking
.PHONY: test bench coverage

test:
	$(DENO) test $(ARGS) $(TEST_FILES)

bench:
	$(DENO) bench $(ARGS) $(BENCH_FILES)

coverage:
	$(DENO) test --coverage=coverage $(ARGS)
	$(DENO) coverage coverage

# Code Quality
.PHONY: fmt lint check

fmt:
	$(DENO) fmt $(ARGS)

lint:
	$(DENO) lint $(ARGS)

check:
	$(DENO) check $(ARGS) $(MAIN_FILE)

# Documentation
.PHONY: doc

doc:
	$(DENO) doc $(ARGS) $(MAIN_FILE)

# Project Management
.PHONY: init info clean upgrade

init:
	$(DENO) init

info:
	$(if $(FILE),$(DENO) info $(FILE),$(DENO) info)

clean:
	$(DENO) cache --clear
	rm -rf $(DENO_DIR) coverage *.exe *.js $(COMPILE_OUTPUT)*

upgrade:
	$(DENO) upgrade $(VERSION)

# Bundle and Publish
.PHONY: bundle publish

bundle:
	$(DENO) bundle $(ARGS) $(MAIN_FILE) bundle.js

publish:
	$(DENO) publish $(ARGS)

# Set help as the default target
.DEFAULT_GOAL := help