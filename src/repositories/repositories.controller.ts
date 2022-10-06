import { Controller, Get } from '@nestjs/common';

@Controller({ path: 'repositories', version: '1' })
export class RepositoriesController {
  @Get()
  fetchRepos() {
    return {
      status: 'success',
      data: {
        id: 1,
        repo: true,
      },
    };
  }
}
