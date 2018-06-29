FROM psychonaut/rust-nightly:latest

COPY . /my-source

RUN cd /my-source && cargo build -v --release

WORKDIR /my-source

CMD ["/my-source/target/release/impis"]
