import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';

const router = Router();

router.use(protect); // All routes protected

router.route('/')
    .get(taskController.getTasks)
    .post(validate(createTaskSchema), taskController.createTask);

router.route('/:id')
    .get(taskController.getTask)
    .patch(validate(updateTaskSchema), taskController.updateTask)
    .delete(taskController.deleteTask);

export default router;
