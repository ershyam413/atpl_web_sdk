import Atpl from "Atpl-sdk-web";

Atpl.init({
  app_key: "YOUR_APP_KEY",
  app_version: "1.0",
  url: "https://your.domain.Atpl",
  debug: true
});

//track sessions automatically
Atpl.track_sessions();

//track pageviews automatically
Atpl.track_pageview();

//track any clicks to webpages automatically
Atpl.track_clicks();

//track link clicks automatically
Atpl.track_links();

//track form submissions automatically
Atpl.track_forms();

//track javascript errors
Atpl.track_errors();

//let's cause some errors
function cause_error(){
    undefined_function();
}

window.onload = function() {
  document.getElementById("handled_error").onclick = function handled_error(){
      Atpl.add_log('Pressed handled button'); 
      try {
          cause_error();
      } catch(err){
          Atpl.log_error(err)
      }
  };

  document.getElementById("unhandled_error").onclick = function unhandled_error(){
      Atpl.add_log('Pressed unhandled button'); 
      cause_error();
  };
}
