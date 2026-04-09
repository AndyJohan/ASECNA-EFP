import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { HealthModule } from './modules/health/health.module';
import { HistoriqueModule } from './modules/historique/historique.module';
import { PredictionModule } from './modules/prediction/prediction.module';
import { CarteModule } from './modules/carte/carte.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { ParametreModule } from './modules/parametre/parametre.module';
import { SupportModule } from './modules/support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.get('database');
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          ssl: db.ssl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    HealthModule,
    HistoriqueModule,
    PredictionModule,
    CarteModule,
    AssistantModule,
    ParametreModule,
    SupportModule,
  ],
})
export class AppModule {}
