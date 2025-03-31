import express from 'express';
import postRoutes from './routes/postRoutes.js';  // Asegúrate de que la ruta esté bien
import commentsRoutes from './routes/commentRoutes.js';
import tagsRoutes from './routes/tagsRoutes.js';
import postTagsRoutes from './routes/postTagsRoutes.js';
import cors from "cors";

import { Post, Tags, PostTags } from './models/index.js';

// Crear una instancia de Express
const app = express();
const port = 3000;  // Puedes cambiar el puerto que desees

// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(cors());
app.use(express.json());  // Esto reemplaza body-parser

// Usar las rutas de posts
app.use('/post', postRoutes);  
app.use('/comments', commentsRoutes);
app.use('/tags', tagsRoutes);
app.use('/postTags', postTagsRoutes);

// Levantar el servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
