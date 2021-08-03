require('dotenv').config();

const rootPath = process.env.NODE_ENV?.toLocaleLowerCase() === 'production'
    ? 'dist' : 'src';

    console.log(rootPath)

module.exports = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    entities: [
        `${rootPath}/core/infra/data/database/entities/**/*`
    ],
    migrations: [
        `${rootPath}/core/infra/data/database/migrations/**/*` 
    ],
    cli: {
        entitiesDir: 'src/core/infra/data/database/entities',
        migrationsDir: 'src/core/infra/data/database/migrations'
    }
}