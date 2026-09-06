.PHONY: test run
test:
	python3 phb/test_engine_v3.py
	python3 -m unittest discover -s app/tests -t .

run:
	python3 -m app.server
