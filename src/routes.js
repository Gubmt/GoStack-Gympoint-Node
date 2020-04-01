import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentsController from './app/controllers/StudentsController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import HelpAnswerController from './app/controllers/HelpAnswerController';
import SelectStudentController from './app/controllers/SelectStudentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.post('/students/:id/checkins', CheckinController.store);
routes.get('/students/:id/checkins', CheckinController.index);

routes.post('/students/:id/help-orders', HelpOrderController.store);
routes.get('/students/:id/help-orders', HelpOrderController.index);

routes.get('/students/registrations', SelectStudentController.index);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/students', StudentsController.store);
routes.put('/students/:id', StudentsController.update);
routes.get('/students', StudentsController.index);
routes.delete('/students/:id', StudentsController.delete);

routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.get('/plans', PlanController.index);
routes.delete('/plans/:id', PlanController.delete);

routes.post('/registrations/:id', RegistrationController.store);
routes.put('/registrations/:id', RegistrationController.update);
routes.get('/registrations', RegistrationController.index);
routes.delete('/registrations/:id', RegistrationController.delete);

routes.get('/help-orders', HelpAnswerController.index);
routes.put('/help-orders/:id/answer', HelpAnswerController.update);

export default routes;
