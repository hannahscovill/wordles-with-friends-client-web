FROM ghcr.io/cargo-lambda/cargo-lambda:latest

WORKDIR /app
COPY Cargo.toml ./
COPY src ./src

# cargo-lambda watch serves the Lambda as a local HTTP endpoint
EXPOSE 9000
CMD ["cargo", "lambda", "watch", "--invoke-port", "9000"]
