import { singleton } from 'tsyringe';
import { UserService } from './user.service';
import { Router } from '../../core/main/router';

@singleton()
export class UserRouter {
  private router: Router;
  constructor(private readonly userService: UserService) {
    this.router = new Router();
    this.init();
  }

  init() {
    this.router.get('/', this.userService.getUser());
  }

  getRouter() {
    return this.router;
  }
}
