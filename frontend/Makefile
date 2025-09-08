.phony: default
default:
	@echo "Nada"

ui-build:
	bun run build

VERSION=0.1.3
NAME=am8850/aimermaidgen:$(VERSION)
docker-build: ui-build
	docker build -t $(NAME) .

docker-push: docker-build
	docker push $(NAME)