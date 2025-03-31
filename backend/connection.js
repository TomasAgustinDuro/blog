import sqlite from "sqlite3";

const db = new sqlite.Database("./db.sqlite");

// Crear las tablas
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, image_url TEXT NOT NULL, created_at TEXT NOT NULL)",
    (err) => {
      if (err) {
        console.error("Error creando la tabla images: ", err.message);
      }
    }
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, image_id INTEGER, title TEXT NOT NULL, content TEXT NOT NULL, date TEXT NOT NULL, FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE)",
    (err) => {
      if (err) {
        console.error("Error creando la tabla posts: ", err.message);
      }
    }
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)",
    (err) => {
      if (err) {
        console.error("Error creando la tabla tags: ", err.message);
      }
    }
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS post_tags (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, tag_id INTEGER NOT NULL, FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE, FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE)",
    (err) => {
      if (err) {
        console.error("Error creando la tabla post_tags: ", err.message);
      }
    }
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, name TEXT NOT NULL, content TEXT NOT NULL, date TEXT NOT NULL, FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE)",
    (err) => {
      if (err) {
        console.error("Error creando la tabla comments: ", err.message);
      }
    }
  );

  // Insertar imágenes
  db.run("INSERT INTO images (image_url, created_at) VALUES (?, ?)", [
    "https://example.com/image1.jpg",
    new Date().toISOString(),
  ]);
  db.run("INSERT INTO images (image_url, created_at) VALUES (?, ?)", [
    "https://example.com/image2.jpg",
    new Date().toISOString(),
  ]);

  // Insertar posts
  db.run(
    "INSERT INTO posts (image_id, title, content, date) VALUES ((SELECT id FROM images WHERE image_url = ?), ?, ?, ?)",
    [
      "https://example.com/image1.jpg",
      "Primer Post de Ejemplo",
      "Este es el contenido del primer post de ejemplo.",
      new Date().toISOString(),
    ]
  );
  db.run(
    "INSERT INTO posts (image_id, title, content, date) VALUES ((SELECT id FROM images WHERE image_url = ?), ?, ?, ?)",
    [
      "https://example.com/image2.jpg",
      "Segundo Post de Ejemplo",
      "Contenido del segundo post de ejemplo.",
      new Date().toISOString(),
    ]
  );

  // Insertar tags
  db.run("INSERT INTO tags (name) VALUES (?)", ["Tecnología"]);
  db.run("INSERT INTO tags (name) VALUES (?)", ["Desarrollo"]);
  db.run("INSERT INTO tags (name) VALUES (?)", ["Cultura"]);
  db.run("INSERT INTO tags (name) VALUES (?)", ["Educación"]);

  // Insertar relaciones entre posts y tags
  db.run(
    "INSERT INTO post_tags (post_id, tag_id) VALUES ((SELECT id FROM posts WHERE title = ?), (SELECT id FROM tags WHERE name = ?))",
    ["Primer Post de Ejemplo", "Tecnología"]
  );
  db.run(
    "INSERT INTO post_tags (post_id, tag_id) VALUES ((SELECT id FROM posts WHERE title = ?), (SELECT id FROM tags WHERE name = ?))",
    ["Primer Post de Ejemplo", "Desarrollo"]
  );
  db.run(
    "INSERT INTO post_tags (post_id, tag_id) VALUES ((SELECT id FROM posts WHERE title = ?), (SELECT id FROM tags WHERE name = ?))",
    ["Segundo Post de Ejemplo", "Cultura"]
  );
  db.run(
    "INSERT INTO post_tags (post_id, tag_id) VALUES ((SELECT id FROM posts WHERE title = ?), (SELECT id FROM tags WHERE name = ?))",
    ["Segundo Post de Ejemplo", "Educación"]
  );

  // Insertar comentarios
  db.run(
    "INSERT INTO comments (post_id, name, content, date) VALUES ((SELECT id FROM posts WHERE title = ?), ?, ?, ?)",
    [
      "Primer Post de Ejemplo",
      "Juan Pérez",
      "¡Genial post! Me encanta el tema.",
      new Date().toISOString(),
    ]
  );
  db.run(
    "INSERT INTO comments (post_id, name, content, date) VALUES ((SELECT id FROM posts WHERE title = ?), ?, ?, ?)",
    [
      "Primer Post de Ejemplo",
      "Ana Gómez",
      "Muy interesante, espero ver más.",
      new Date().toISOString(),
    ]
  );
  db.run(
    "INSERT INTO comments (post_id, name, content, date) VALUES ((SELECT id FROM posts WHERE title = ?), ?, ?, ?)",
    [
      "Segundo Post de Ejemplo",
      "Luis Rodríguez",
      "Excelente artículo, muy informativo.",
      new Date().toISOString(),
    ]
  );

  db.all("SELECT * FROM posts", (err, rows) => {
    if (err) {
      console.error("Error fetching posts: ", err.message);
      return;
    }
    console.log(rows); // Aquí se imprimirán todos los registros de la tabla 'posts'
  });
});

// Cerrar la base de datos
db.close((err) => {
  if (err) {
    console.error("Error cerrando la base de datos: ", err.message);
  } else {
    console.log("Base de datos cerrada exitosamente.");
  }
});
