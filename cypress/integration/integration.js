var Atpl = require("../../lib/Atpl");
var hp = require("../support/helper");

/**
 *  init Atpl
 */
function initMain() {
    Atpl.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.Atpl",
        debug: true,
        test_mode: true
    });
}

describe("Integration test", () => {
    it("int, no consent, no offline_mode", () => {
        initMain();
        const idType = Atpl.get_device_id_type();
        const id = Atpl.get_device_id();
        const consentStatus = Atpl.check_any_consent();
        Atpl.remove_consent();
        Atpl.disable_offline_mode();
        Atpl.add_event({ key: "test", count: 1, sum: 1, dur: 1, segmentation: { test: "test" } });
        Atpl.start_event("test");
        Atpl.cancel_event("gobbledygook");
        Atpl.end_event("test");
        Atpl.report_conversion("camp_id", "camp_user_id");
        Atpl.recordDirectAttribution("camp_id", "camp_user_id");
        Atpl.user_details({ name: "name" });
        Atpl.userData.set("set", "set");
        Atpl.userData.save();
        Atpl.report_trace({ name: "name", stz: 1, type: "type" });
        Atpl.log_error({ error: "error", stack: "stack" });
        Atpl.add_log("error");
        Atpl.fetch_remote_config();
        Atpl.enrollUserToAb();
        const remote = Atpl.get_remote_config();
        Atpl.track_sessions();
        Atpl.track_pageview();
        Atpl.track_errors();
        Atpl.track_clicks();
        Atpl.track_scrolls();
        Atpl.track_links();
        Atpl.track_forms();
        Atpl.collect_from_forms();
        Atpl.collect_from_facebook();
        Atpl.opt_in();
        // TODO: widgets
        // TODO: make better
        cy.fetch_local_request_queue().then((rq) => {
            cy.log(rq);
            hp.testNormalFlow(rq, "/__cypress/iframes/integration%2Fintegration.js", hp.appKey);
            expect(consentStatus).to.equal(true); // no consent necessary
            expect(remote).to.eql({}); // deepEqual
            expect(rq[0].device_id).to.equal(id);
            expect(rq[0].t).to.equal(idType);
        });
    });
});