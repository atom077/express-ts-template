import { AutoCache, CacheOptions } from '../basic/decorator';

class ExampleService {
    @AutoCache('express-ts-template:example:${0}', 60)
    async get(id: string, _options?: CacheOptions) {
        return {
            id,
            message: 'replace this example service with your business logic',
            generatedAt: new Date().toISOString(),
        };
    }
}

export default new ExampleService();
