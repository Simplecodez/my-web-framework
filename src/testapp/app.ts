import { singleton } from 'tsyringe';
import { Application } from '../core/main/application';
import { UserRouter } from './user/user.route';

@singleton()
export class App {
  private app: Application;
  constructor(private readonly userRouter: UserRouter) {
    this.app = new Application();
    this.initialize();
  }

  initialize() {
    this.app.use('/users', this.userRouter.getRouter());
    this.app.use((err, req, res, next) => {
      console.log(err);
      res.send('something broke...');
    });
  }

  start() {
    this.app.listen(3000, () => {
      console.log('Running on port 3000');
    });
  }
}
