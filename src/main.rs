#![feature(plugin, decl_macro, custom_derive)]
#![plugin(rocket_codegen)]

extern crate rocket;
#[macro_use] extern crate rocket_contrib;
#[macro_use] extern crate serde_derive;

extern crate time;

extern crate rand;

extern crate ring;

#[macro_use(bson, doc)]
extern crate bson;

extern crate mongodb;

#[macro_use] extern crate bart_derive;

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

use bson::Bson;
use mongodb::{Client, ThreadedClient};
use mongodb::db::ThreadedDatabase;

use ring::{digest, test};

#[get("/")]
fn static_index() -> io::Result<NamedFile> {
    NamedFile::open("static/index.html")
}

#[get("/new")]
fn static_new() -> io::Result<NamedFile> {
    NamedFile::open("static/new.html")
}

#[get("/js/<file..>")]
fn static_files(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("static/js/").join(file)).ok()
}

#[derive(BartDisplay)]
#[template = "templates/post.html"]
struct PostPage {
    title: String,
    body: String
}

#[derive(FromForm, Deserialize)]
struct NewPost {
   body: String,
   title: String
}

struct ByteBuf<'a>(&'a [u8]);

impl<'a> std::fmt::LowerHex for ByteBuf<'a> {
    fn fmt(&self, fmtr: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        for byte in self.0 {
            try!( fmtr.write_fmt(format_args!("{:02x}", byte)));
        }
        Ok(())
    }
}

// returns (hash, bool: was created?)
fn create_post(post: &NewPost) -> (String, bool) {
    let ref title = post.title;
    let ref body = post.body;

    let client = Client::connect("localhost", 27017)
        .expect("Failed to initialize standalone client.");
    
    let coll = client.db("anonium").collection("posts");

    let hash = digest::digest(&digest::SHA256, body.as_bytes());

    let ref hash_str = format!("{:x}", ByteBuf(hash.as_ref()));

    match coll.find_one(Some(doc! { "hash": hash_str }), None) {
        Ok(Some(_)) => {
            (hash_str.to_string(), false)
        },
        // trap Ok(None) and Err(_) (not found & error)
        _ => {
            let doc = doc! { 
                "body": body,
                "title": title,
                "hash": hash_str
            };

            coll.insert_one(doc, None)
                .ok().expect("Failed to insert document.");

            (hash_str.to_string(), true)
        }
    }
}

#[post("/new", data = "<new_post_data>")]
fn new_post(new_post_data: Form<NewPost>) -> Redirect {
    let ref post_data = new_post_data.get();

    let (hash_str, _) = create_post(post_data);

    return Redirect::temporary(
        &format!("/n/{}", hash_str)
    );
}

#[post("/new-async", data = "<new_post_data>")]
fn new_post_async(new_post_data: Json<NewPost>) -> Json<Value> {
    let ref post_data = new_post_data.0;

    let (hash_str, created) = create_post(post_data);

    Json(json!({
        "created": created,
        "hash": hash_str
    }))
}

#[get("/n/<hash>")]
fn post_page(hash: String) -> Html<String> {
    let client = Client::connect("localhost", 27017)
        .expect("Failed to initialize standalone client.");
    
    let coll = client.db("anonium").collection("posts");

    match coll.find_one(Some(doc! { "hash": &hash }), None) {
        Ok(Some(ref doc)) => {
            println!("{:?}", doc);

            let post_page = PostPage {
                title: doc.get_str("title").unwrap().to_string(),
                body: doc.get_str("body").unwrap().to_string()
            };

            Html(post_page.to_string())
        },
        _ => {
            let post_page = PostPage {
                title: "Error".to_string(),
                body: "Could not find entry".to_string()
            };

            return Html(post_page.to_string());
        }
    }
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
            post_page,
            static_index,
            static_new,
            static_files,
            new_post,
            new_post_async
        ])
        .catch(errors![not_found])
        .launch();
}