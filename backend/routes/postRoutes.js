import express from 'express';
import { PostControllers } from '../controllers/postControllers.js';

const router = express.Router();  

router.get('/', (req, res) => {
    PostControllers.getAllPost(req, res);
});

router.get('/:id', (req, res) => {
    PostControllers.getSpecificPost(req, res);
});

router.get('/:tag', (req, res) => {
    PostControllers.getByTag(req, res);
});

router.post('/create', (req, res) => {
    PostControllers.createPost(req, res);
});

router.put('/edit/:id', (req, res) => {
    PostControllers.editPost(req, res);
});

router.delete('/delete/:id', (req, res) => {
    console.log('ID recibido en el backend:', req.params.id);  // Verificar que el ID llega
    PostControllers.deletePost(req, res);
});

export default router;
