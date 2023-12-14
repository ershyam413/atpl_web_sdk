importScripts("../lib/Atpl.js");

const STORE={}; // in-memory storage for worker

Atpl.init({
    app_key: "YOUR_APP_KEY",
    url: "https://your.domain.Atpl",
    debug: true,
    storage: {
        getItem: function (key) {
            return STORE[key];
        },
        setItem: function (key, value) {
            STORE[key] = value;
        },
        removeItem: function (key) {
            delete STORE[key];
        }
    }
});

onmessage = function (e) {
    console.log(`Worker: Message received from main script:[${JSON.stringify(e.data)}]`);
    const data = e.data.data; const type = e.data.type;
    if (type === "event") {
        Atpl.add_event(data);
    } else if (type === "view") {
        Atpl.track_pageview(data);
    } else if (type === "session") {
        if (data === "begin_session") {
            Atpl.begin_session();
            return;
        }
        Atpl.end_session(null, true);   
    }
}