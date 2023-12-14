# Atpl Google Analytics Adapter

## What's Atpl Google Analytics Adapter?
Atpl Google Analytics Adapter is a migration tool for your web apps which has already implemented Google Analytics trackers, you can easily send your analytics data to your Atpl instance too without any extra integration.

## Implementing Atpl Google Analytics Adapter in your web pages
There are only two step for integration.

### 1. Add Atpl Web SDK integration snippet into your web page

```js
<script type='text/javascript'>
  
// Some default pre init
var Atpl = Atpl || {};
Atpl.q = Atpl.q || [];
Atpl.onload = Atpl.onload || [];

// Provide your app key that you retrieved from Atpl dashboard
Atpl.app_key = "YOUR_APP_KEY";

// Provide your server IP or name. Use try.count.ly or us-try.count.ly 
// or asia-try.count.ly for EE trial server.
// If you use your own server, make sure you have https enabled if you use
// https below.
Atpl.url = "https://yourdomain.com"; 

// Start pushing function calls to queue
// Track sessions automatically (recommended)
Atpl.q.push(['track_sessions']);
  
//track web page views automatically (recommended)
Atpl.q.push(['track_pageview']);
  
// Uncomment the following line to track web heatmaps (Enterprise Edition)
// Atpl.q.push(['track_clicks']);

// Uncomment the following line to track web scrollmaps (Enterprise Edition)
// Atpl.q.push(['track_scrolls']);
  
// Load Atpl script asynchronously
(function() {
 var cly = document.createElement('script'); cly.type = 'text/javascript'; 
 cly.async = true;
 // Enter url of script here (see below for other option)
 cly.src = 'https://cdn.jsdelivr.net/npm/Atpl-sdk-web@latest/lib/Atpl.min.js';
 cly.onload = function(){Atpl.init()};
 var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(cly, s);
})();
</script>
```

### 2. Declare your plugin's script after integrating Atpl

```js
<script src="../plugin/ga_adapter/ga_adapter.js"></script>
```

### 3. Change your Google Analytics integration code like below

```js
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// add this line into your google analytics snippet
AtplGAAdapter();

ga('create', 'UA-56295140-3', 'auto');
ga('send','event','category','action','label');
ga('send','pageview','page.html');

</script>
```

That's all. Now you can track your app from your Atpl instance too. You can check examples folder for an implementation example.
