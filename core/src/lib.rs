#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate crypto;
use crypto::digest::Digest;
use crypto::buffer::{WriteBuffer, ReadBuffer};

extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

extern crate bs58;
extern crate hex;

const __STATIC_SALT__: &'static str = "x82eMQjJmrKio7gJO/62GFtQBd5yLbw8eQLFwCbTJIk=";

#[wasm_bindgen]
pub struct Impis {
    title: String,
    body: String,

    _pass: Option<Vec<u8>>,
    _key: Option<Vec<u8>>,
    _iv: Option<Vec<u8>>,
}

#[wasm_bindgen]
impl Impis {
    pub fn new(title: String, body: String) -> Impis {
        Impis {
            _key: None,
            _iv: None,
            _pass: None,

            title, body
        }
    }

    pub fn init_with_pass(&mut self, pass: String) {
        self._pass = Some(pass.clone().as_bytes().to_vec());

        self._init();
    }

    pub fn init_generate_pass(&mut self, seed: &[u8]) -> String {
        let mut sha256_hasher = crypto::sha2::Sha256::new();

        sha256_hasher.input(seed.clone());

        let mut pass = [0u8; 32];
        sha256_hasher.result(&mut pass);

        let pass = bs58::encode(&pass).into_string();

        self._pass = Some(pass.as_bytes().to_vec());

        self._init();

        pass
    }

    fn _init(&mut self) {
        let scrypt_params = crypto::scrypt::ScryptParams::new(10, 8, 1);
        let pass = &self._pass.clone().unwrap();
        let salt = __STATIC_SALT__.as_bytes();

        let mut output = vec![0u8; 32];

        crypto::scrypt::scrypt(pass, salt, &scrypt_params, &mut output);

        let mut sha256_hasher = crypto::sha2::Sha256::new();

        sha256_hasher.input(&output);

        let mut output = vec![0u8; 32];
        sha256_hasher.result(&mut output);

        let key = output;

        sha256_hasher.reset();
        sha256_hasher.input(&key);

        let mut output = vec![0u8; 32];
        sha256_hasher.result(&mut output);

        let iv = output[16..32].to_vec();

        self._key = Some(key.to_vec());
        self._iv = Some(iv);
    }

    fn _encrypt(&self, encrypted_data: &[u8]) -> Result<Vec<u8>, crypto::symmetriccipher::SymmetricCipherError> {
        let key = self._key.clone();
        let iv = self._iv.clone();

        let mut encryptor = crypto::aes::cbc_encryptor(
            crypto::aes::KeySize::KeySize256,
            &key.unwrap(),
            &iv.unwrap(),
            crypto::blockmodes::PkcsPadding
        );

        let mut final_result = Vec::<u8>::new();
        let mut read_buffer = crypto::buffer::RefReadBuffer::new(encrypted_data);
        let mut buffer = [0; 4096];
        let mut write_buffer = crypto::buffer::RefWriteBuffer::new(&mut buffer);

        loop {
            let result = encryptor.encrypt(&mut read_buffer, &mut write_buffer, true)?;

            final_result.extend(write_buffer.take_read_buffer().take_remaining().iter().map(|&i| i));

            match result {
                crypto::buffer::BufferResult::BufferUnderflow => break,
                crypto::buffer::BufferResult::BufferOverflow => { }
            }
        }

        Ok(final_result)
    }

    fn _decrypt(&self, encrypted_data: &[u8]) -> Result<Vec<u8>, crypto::symmetriccipher::SymmetricCipherError> {
        let key = self._key.clone();
        let iv = self._iv.clone();

        let mut decryptor = crypto::aes::cbc_decryptor(
            crypto::aes::KeySize::KeySize256,
            &key.unwrap(),
            &iv.unwrap(),
            crypto::blockmodes::PkcsPadding
        );

        let mut final_result = Vec::<u8>::new();
        let mut read_buffer = crypto::buffer::RefReadBuffer::new(encrypted_data);
        let mut buffer = [0; 4096];
        let mut write_buffer = crypto::buffer::RefWriteBuffer::new(&mut buffer);

        loop {
            let result = decryptor.decrypt(&mut read_buffer, &mut write_buffer, true)?;

            final_result.extend(write_buffer.take_read_buffer().take_remaining().iter().map(|&i| i));

            match result {
                crypto::buffer::BufferResult::BufferUnderflow => break,
                crypto::buffer::BufferResult::BufferOverflow => { }
            }
        }

        Ok(final_result)
    }

    pub fn get_dec_title(&self) -> Vec<u8> {
        let title_bytes = match hex::decode(&self.title) {
            Ok(bytes) => bytes,
            _ => { return Vec::new(); }
        };

        let title_bytes = title_bytes.clone();

        match self._decrypt(&title_bytes) {
            Ok(bytes) => bytes,
            _ => Vec::new()
        }
    }

    pub fn get_dec_title_str(&self) -> String {
        String::from_utf8_lossy(&self.get_dec_title()).into_owned()
    }

    pub fn get_dec_body(&self) -> Vec<u8> {
        let body_bytes = match hex::decode(&self.body) {
            Ok(bytes) => bytes,
            _ => { return Vec::new(); }
        };

        let body_bytes = body_bytes.clone();

        match self._decrypt(&body_bytes) {
            Ok(bytes) => bytes,
            _ => Vec::new()
        }
    }

    pub fn get_dec_body_str(&self) -> String {
        String::from_utf8_lossy(&self.get_dec_body()).into_owned()
    }

    pub fn get_enc_title(&self) -> String {
        let title = self.title.clone();
        let title_bytes = title.as_bytes();

        let ciphertext = match self._encrypt(&title_bytes) {
            Ok(bytes) => bytes,
            _ => Vec::new()
        };

        hex::encode(ciphertext)
    }

    pub fn get_enc_body(&self) -> String {
        let body = self.body.clone();
        let body_bytes = body.as_bytes();

        let ciphertext = match self._encrypt(&body_bytes) {
            Ok(bytes) => bytes,
            _ => Vec::new()
        };

        hex::encode(ciphertext)
    }
}