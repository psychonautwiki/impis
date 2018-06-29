all:
	cargo build --target=wasm32-unknown-unknown --release \
	&& wasm-bindgen --browser --no-modules target/wasm32-unknown-unknown/release/foo.wasm --out-dir out/ \
	&& rm -f dist/* \
	&& parcel build --experimental-scope-hoisting lib/*.html \
	&& wasm-opt -O3 out/foo_bg.wasm -o dist/main.wasm \
	&& sed -i.bak "s/src\=\"\/new/src\=\"\/js\/new/g" dist/new.html \
	&& sed -i.bak "s/src\=\"\/note/src\=\"\/js\/note/g" dist/note.html \
	&& rm dist/*.html.bak

# --nodejs
# --browser --no-modules