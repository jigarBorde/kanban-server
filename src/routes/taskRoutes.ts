import express from 'express';
import { createTask, getAllTasks, updateTaskStatus, getAllUsers, updateTask, deleteTask } from '../controllers/board/boardController';
import { authenticateJWT } from '../middlewares/auth';

const router = express.Router();


router.post('/create', authenticateJWT, createTask);
router.get('/get', authenticateJWT, getAllTasks);
router.patch('/:id', authenticateJWT, updateTaskStatus);
router.get('/users/getall', authenticateJWT, getAllUsers);
router.put('/:id', authenticateJWT, updateTask);
router.delete('/:id', authenticateJWT, deleteTask);

export default router;
