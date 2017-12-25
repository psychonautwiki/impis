#![feature(plugin, decl_macro, custom_derive)]
#![plugin(rocket_codegen)]

extern crate rocket;
#[macro_use] extern crate rocket_contrib;

extern crate time;

extern crate rand;

use rocket::http::{Cookie, Cookies};

use rand::Rng;

#[cfg(test)] mod tests;

use rocket::Outcome;
use rocket::request::{self, Request, FromRequest, Form};

use rocket::response::NamedFile;
use rocket::response::content::{Html, JavaScript};

use rocket_contrib::{Json, Value};

use rocket::response::Redirect;

use std::io;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

#[get("/")]
fn static_index() -> io::Result<NamedFile> {
    NamedFile::open("static/index.html")
}

#[get("/<file..>")]
fn static_files(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("static/").join(file)).ok()
}

#[derive(FromForm)]
struct NewPost {
   body: String
}

#[post("/new", data = "<new_post_data>")]
fn new_post(new_post_data: Form<NewPost>) -> Json<Value> {
    let body = &new_post_data.get().body;

    Json(json!({
        "body": body
    }))
}

#[error(404)]
fn not_found() -> Json<Value> {
    Json(json!({
        "status": "error",
        "reason": "Resource was not found."
    }))
}

fn main() {
    rocket::ignite()
        .mount("/", routes![
            static_index,
            static_files,
            new_post
        ])
        .catch(errors![not_found])
        .launch();
}