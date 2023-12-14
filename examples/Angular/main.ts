import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import Atpl from 'Atpl-sdk-web';

window.Atpl = Atpl;

Atpl.init({
  app_key: "YOUR_APP_KEY",
  url: "https://your.domain.Atpl",
  debug: true
});
Atpl.track_sessions();

if (environment.production) {
  enableProdMode();

}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
