import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const string = 'Hello World';
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
