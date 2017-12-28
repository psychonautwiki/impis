#FROM psychonaut/rust-nightly:latest
FROM htli/rust-nightly:2017-12-16

COPY . /my-source

RUN cd /my-source && cargo build -v --release

WORKDIR /my-source

CMD ["/my-source/target/release/anonium"]
