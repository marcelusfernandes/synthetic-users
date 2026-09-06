.PHONY: test run
test:
	python3 phb/test_engine_v3.py
	@# descoberta, não enumeração: o negative-control do loop copia só arquivos de
	@# teste sobre a base, então árvores novas (app/tests/) precisam ser achadas em runtime.
	@if [ -d app/tests ]; then python3 -m unittest discover -s app/tests -t . || exit 1; fi

run:
	python3 -m app.server
