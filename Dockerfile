FROM psychonaut/rust-nightly:latest

COPY . /my-source

RUN cd /my-source && cargo build -v --release

CMD ["/my-source/target/release/anonium"]
