# Restart local docker containers
restart-local-docker:
	docker-compose down
	docker-compose -f docker-compose.dev.yml up -d

rebuild-local-docker:
	docker-compose down
	docker-compose -f docker-compose.dev.yml up -d --build
