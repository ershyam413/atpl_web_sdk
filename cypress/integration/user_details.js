/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Atpl = require("../../lib/Atpl");
var hp = require("../support/helper");

function initMain() {
    Atpl.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.Atpl",
        test_mode_eq: true,
        test_mode: true
    });
}

const userDetailObj = hp.userDetailObj;

// an event object to use 
const eventObj = {
    key: "in_app_purchase",
    count: 3,
    sum: 2.97,
    dur: 300,
    segmentation: {
        app_version: "1.0",
        country: "Tahiti"
    }
};

describe("User details tests ", () => {
    it("Checks if user detail recording works (normal flow)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.user_details(userDetailObj);
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.length).to.equal(1);
                cy.check_user_details(rq[0], userDetailObj);
            });
        });
    });
    it("Checks if user detail recording works (events are flushed)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.add_event(eventObj);
            cy.fetch_local_event_queue().then((eq) => { // event should be in event queue
                expect(eq.length).to.equal(1);
                cy.check_event(eq[0], eventObj, undefined, false);
            });
            cy.wait(300).then(() => {
                Atpl.user_details(userDetailObj);
                cy.fetch_local_request_queue().then((rq) => { // events and user details must be here
                    expect(rq.length).to.equal(2);
                    cy.check_event(JSON.parse(rq[0].events)[0], eventObj, undefined, false);
                    cy.check_user_details(rq[1], userDetailObj);
                });
                cy.fetch_local_event_queue().then((eq) => { // event queue should be empty
                    expect(eq.length).to.equal(0);
                });
            });
        });
    });
    it("Checks if custom detail recording works (set)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.set("key", "value");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.equal("value");
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (set, array)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.set("key", ["value"]);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql(["value"]); // eql is deepequal
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (unset)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.unset("key"); // unset works by sending an empty string with the key
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.equal("");
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (set_once)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.set_once("key", "value");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $setOnce: "value" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (increment)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.increment("key");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $inc: 1 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (increment_by, + number )", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.increment_by("key", 10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $inc: 10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (increment_by, - number )", () => { // TODO: Investigate
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.increment_by("key", -10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $inc: -10 }); // eql is deepequal
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (increment_by, string)", () => { // TODO: Investigate
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.increment_by("key", "10");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $inc: "10" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (multiply, + number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.multiply("key", 10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $mul: 10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (multiply, - number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.multiply("key", -10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $mul: -10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (multiply, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.multiply("key", "10");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $mul: "10" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (max, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.max("key", 10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $max: 10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (max, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.max("key", "10");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $max: "10" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (min, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.min("key", 10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $min: 10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (min, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.min("key", "10");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $min: "10" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (push, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.push("key", 10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $push: [10] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (push, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.push("key", "10");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $push: ["10"] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (push_unique, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.push_unique("key", 10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $addToSet: [10] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (push_unique, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.push_unique("key", "10");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $addToSet: ["10"] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (pull, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.pull("key", 10);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $pull: [10] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (pull, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.pull("key", "10");
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $pull: ["10"] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if all custom detail recording works together", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.set("key", "value");
            Atpl.userData.unset("key2");
            Atpl.userData.set_once("key3", 1);
            Atpl.userData.increment("key4");
            Atpl.userData.increment_by("key5", 2);
            Atpl.userData.multiply("key6", 3);
            Atpl.userData.max("key7", 4);
            Atpl.userData.min("key8", 5);
            Atpl.userData.push("key9", 6);
            Atpl.userData.push_unique("key10", 7);
            Atpl.userData.pull("key11", 8);
            Atpl.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(Object.keys(custom).length).to.equal(11);
                    expect(custom.key).to.equal("value");
                    expect(custom.key2).to.equal("");
                    expect(custom.key3).to.eql({ $setOnce: 1 });
                    expect(custom.key4).to.eql({ $inc: 1 });
                    expect(custom.key5).to.eql({ $inc: 2 });
                    expect(custom.key6).to.eql({ $mul: 3 });
                    expect(custom.key7).to.eql({ $max: 4 });
                    expect(custom.key8).to.eql({ $min: 5 });
                    expect(custom.key9).to.eql({ $push: [6] });
                    expect(custom.key10).to.eql({ $addToSet: [7] });
                    expect(custom.key11).to.eql({ $pull: [8] });
                });
            });
        });
    });
    it("Checks if all custom detail recording works together (early save)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.set("key", "value");
            Atpl.userData.unset("key2");
            Atpl.userData.set_once("key3", 1);
            Atpl.userData.increment("key4");
            Atpl.userData.save();
            Atpl.userData.increment_by("key5", 2);
            Atpl.userData.multiply("key6", 3);
            Atpl.userData.max("key7", 4);
            Atpl.userData.min("key8", 5);
            Atpl.userData.push("key9", 6);
            Atpl.userData.push_unique("key10", 7);
            Atpl.userData.pull("key11", 8);
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(Object.keys(custom).length).to.equal(4);
                    expect(custom.key).to.equal("value");
                    expect(custom.key2).to.equal("");
                    expect(custom.key3).to.eql({ $setOnce: 1 });
                    expect(custom.key4).to.eql({ $inc: 1 });
                });
            });
        });
    });
    it("Checks if all custom detail recording wont works without save", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.userData.set("key", "value");
            Atpl.userData.unset("key2");
            Atpl.userData.set_once("key3", 1);
            Atpl.userData.increment("key4");
            Atpl.userData.increment_by("key5", 2);
            Atpl.userData.multiply("key6", 3);
            Atpl.userData.max("key7", 4);
            Atpl.userData.min("key8", 5);
            Atpl.userData.push("key9", 6);
            Atpl.userData.push_unique("key10", 7);
            Atpl.userData.pull("key11", 8);
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.length).to.equal(0);
            });
        });
    });
    it("Checks all custom detail recording, event flush (with save)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.add_event(eventObj);
            cy.fetch_local_event_queue().then((eq) => { // event should be in event queue
                expect(eq.length).to.equal(1);
                cy.check_event(eq[0], eventObj, undefined, false);
            });
            cy.wait(300).then(() => {
                Atpl.userData.set("key", "value");
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(0);
                });
                cy.fetch_local_event_queue().then((eq) => { // event should be in event queue
                    expect(eq.length).to.equal(1);
                    cy.check_event(eq[0], eventObj, undefined, false);
                });
            });
        });
    });
    it("Checks all custom detail recording, event flush (without save)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.add_event(eventObj);
            cy.fetch_local_event_queue().then((eq) => { // event should be in event queue
                expect(eq.length).to.equal(1);
                cy.check_event(eq[0], eventObj, undefined, false);
            });
            cy.wait(300).then(() => {
                Atpl.userData.set("key", "value");
                Atpl.userData.save();

                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(2);
                    cy.check_event(JSON.parse(rq[0].events)[0], eventObj, undefined, false);
                    const custom = JSON.parse(rq[1].user_details).custom;
                    expect(Object.keys(custom).length).to.equal(1);
                    expect(custom.key).to.equal("value");
                });
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(0);
                });
            });
        });
    });
});
