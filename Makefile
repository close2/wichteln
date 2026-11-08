.PHONY: build run test analyze clean

build:
	toit compile --strip -O2 -o wichteln-server server.toit

run:
	toit run server.toit config.json public

test:
	toit run solver_test.toit

analyze:
	toit analyze solver.toit smtp.toit server.toit solver_test.toit

clean:
	rm -f wichteln-server
