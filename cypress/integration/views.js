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

/** 
 * Checks if the cvid is the same for all events in the queue but ids are different and pvid is undefined
 * @param {string} expectedCvid - expected view id
 * @param {Array} eventQ - events queue
 * @param {number} startIndex - start index of the queue
 * @param {number} endIndex - end index of the queue
*/
function listIdChecker(expectedCvid, eventQ, startIndex, endIndex) {
    if (!endIndex || !startIndex || endIndex < startIndex) { // prevent infinite loop
        cy.log("Wrong index information");
        return;
    }
    var i = startIndex;
    var lastIdList = []; // pool of ids
    while (i < endIndex) {
        expect(eventQ[i].cvid).to.equal(expectedCvid);
        expect(eventQ[i].pvid).to.be.undefined; // there should not be pvid
        if (lastIdList.length > 0) {
            expect(lastIdList.indexOf(eventQ[i].id)).to.equal(-1); // we check this id against all ids in the list
        }
        lastIdList.push(eventQ[i].id); // we add this id to the list of ids
        i++;
    }
}

var pageNameOne = "test view page name1";
var pageNameTwo = "test view page name2";

describe("View ID tests ", () => {
    it("Checks if UUID and secureRandom works as intended", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            const uuid = Atpl._internals.generateUUID();
            const id = Atpl._internals.secureRandom();
            assert.equal(uuid.length, 36);
            assert.equal(id.length, 21);
            const uuid2 = Atpl._internals.generateUUID();
            const id2 = Atpl._internals.secureRandom();
            assert.equal(uuid2.length, 36);
            assert.equal(id2.length, 21);
            assert.notEqual(uuid, uuid2);
            assert.notEqual(id, id2);
        });
    });
    it("Checks if recording page view works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.track_view(pageNameOne);
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
            });
        });
    });
    it("Checks if recording timed page views with same name works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.track_view(pageNameOne);
            cy.wait(3000).then(() => {
                Atpl.track_view(pageNameOne);
                cy.fetch_local_event_queue().then((eq) => {
                    cy.log(eq);
                    expect(eq.length).to.equal(3);
                    cy.check_view_event(eq[0], pageNameOne, undefined, false);
                    const id1 = eq[0].id;

                    cy.check_view_event(eq[1], pageNameOne, 3, false);
                    const id2 = eq[1].id;
                    assert.equal(id1, id2);

                    cy.check_view_event(eq[2], pageNameOne, undefined, true);
                    const id3 = eq[2].id;
                    const pvid = eq[2].pvid;
                    assert.equal(id1, pvid);
                    assert.notEqual(id3, pvid);
                });
            });
        });
    });
    it("Checks if recording timed page views with different name works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.track_view(pageNameOne);
            hp.waitFunction(hp.getTimestampMs(), 4000, 500, ()=>{
                Atpl.track_view(pageNameTwo);
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(3);
                    cy.check_view_event(eq[0], pageNameOne, undefined, false);
                    const id1 = eq[0].id;

                    // this test is flaky we are expecting 3 and +1 (4) to make test more reliable 
                    cy.check_view_event(eq[1], pageNameOne, 4, false);
                    const id2 = eq[1].id;
                    assert.equal(id1, id2);

                    cy.check_view_event(eq[2], pageNameTwo, undefined, true);
                    const id3 = eq[2].id;
                    const pvid = eq[2].pvid;
                    assert.equal(id1, pvid);
                    assert.notEqual(id3, pvid);
                });
            });
        });
    });

    // ===========================
    //  Confirms:
    // view A's id and event A's cvid are same
    // view B's id and event B's cvid are same. Also view B's pvid and view A's id are same
    // view C's id and event C's cvid are same. Also view C's pvid and view B's id are same
    //
    // request order: view A start -> internal can custom events -> event A -> view A end -> view B start -> internal can custom events -> event B -> view B end -> view C start -> internal can custom events -> event C  
    // ===========================
    it("Checks a sequence of events and page views", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.track_view("A");
            hp.events(["[CLY]_view"]);
            Atpl.add_event({ key: "A" });
            Atpl.track_view("B");
            hp.events(["[CLY]_view"]);

            Atpl.add_event({ key: "B" });
            Atpl.track_view("C");
            hp.events(["[CLY]_view"]);
            Atpl.add_event({ key: "C" });

            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(26);
                cy.log(eq);

                // event A and view A
                cy.check_view_event(eq[0], "A", undefined, false); // no pvid
                const idA = eq[0].id; // idA
                listIdChecker(idA, eq, 1, 7); // check all internal events in view A
                cy.check_event(eq[7], { key: "A" }, undefined, idA); // cvid should be idA
                cy.check_view_event(eq[8], "A", 0, false); // no pvid

                // event B and view B
                cy.check_view_event(eq[9], "B", undefined, idA); // pvid is idA
                const idB = eq[9].id; // idB
                listIdChecker(idB, eq, 10, 16); // check all internal events in view B 
                cy.check_event(eq[16], { key: "B" }, undefined, idB); // cvid should be idB
                cy.check_view_event(eq[17], "B", 0, idA); // pvid is idA

                // event C and view C
                cy.check_view_event(eq[18], "C", undefined, idB); // pvid is idB
                const idC = eq[18].id; // idC
                listIdChecker(idC, eq, 19, 25); // check all internal events in view C
                cy.check_event(eq[25], { key: "C" }, undefined, idC); // cvid should be idC  
            });
        });
    });

    // ===========================
    //  Confirms:                           CVID    |   PVID    |   ID
    //                                    ++--------+-----------+-------++  
    // record events before first view =>     ""      undefined    rnd
    // record A view                   =>  undefined     ""        idA    
    // record events under view A      =>    idA      undefined    rnd
    // record A view (close)           =>  undefined     ""        idA
    // record B view                   =>  undefined     idA       idB
    // record events under view B      =>    idB      undefined    rnd
    // record B view (close)           =>  undefined     idA       idB
    // record C view                   =>  undefined     idB       idC
    // record events under view C      =>     idC     undefined    rnd
    //                                   ++--------+-----------+-------++
    // request order: internal can custom events -> view A start -> event A -> view A end -> view B start -> internal can custom events -> event B -> view B end -> view C start -> internal can custom events -> event C
    // ===========================
    it("Checks a sequence of events and page views, with events before first view", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            hp.events(["[CLY]_view"]); // first events

            Atpl.track_view("A");
            Atpl.add_event({ key: "A" });
            Atpl.track_view("B");
            hp.events(["[CLY]_view"]);

            Atpl.add_event({ key: "B" });
            Atpl.track_view("C");
            hp.events(["[CLY]_view"]);
            Atpl.add_event({ key: "C" });

            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(26);
                cy.log(eq);

                listIdChecker("", eq, 0, 6); // check all internal events before view A

                // event A and view A
                cy.check_view_event(eq[6], "A", undefined, false); // no pvid
                const idA = eq[6].id; // idA
                cy.check_event(eq[7], { key: "A" }, undefined, idA); // cvid should be idA
                cy.check_view_event(eq[8], "A", 0, false); // no pvid

                // event B and view B
                cy.check_view_event(eq[9], "B", undefined, idA); // pvid is idA
                const idB = eq[9].id; // idB
                listIdChecker(idB, eq, 10, 16); // check all internal events in view B 
                cy.check_event(eq[16], { key: "B" }, undefined, idB); // cvid should be idB
                cy.check_view_event(eq[17], "B", 0, idA); // pvid is idA

                // event C and view C
                cy.check_view_event(eq[18], "C", undefined, idB); // pvid is idB
                const idC = eq[18].id; // idC
                listIdChecker(idC, eq, 19, 25); // check all internal events in view C
                cy.check_event(eq[25], { key: "C" }, undefined, idC); // cvid should be idC  
            });
        });
    });

    // check end_session usage
    it("Checks a sequence of events and page views, with end_session, no session started", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            hp.events(["[CLY]_view"]); // first events
            Atpl.end_session(); // no session started must be ignored
            Atpl.track_view("A");
            Atpl.add_event({ key: "A" });

            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(8);
                cy.log(eq);

                listIdChecker("", eq, 0, 6); // check all internal events before view A

                // event A and view A
                cy.check_view_event(eq[6], "A", undefined, false); // no pvid
                const idA = eq[6].id; // idA
                cy.check_event(eq[7], { key: "A" }, undefined, idA); // cvid should be idA
            });
        });
    });
    it("Checks a sequence of events and page views, with end_session, with session started", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.track_sessions();
            hp.events(["[CLY]_view"]); // first events
            Atpl.end_session(); // no view started so must be ignored
            Atpl.track_view("A");
            Atpl.add_event({ key: "A" });

            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(9); // orientation added
                cy.log(eq);

                cy.check_event(eq[0], { key: "[CLY]_orientation" }, undefined, ""); // internal event

                listIdChecker("", eq, 1, 7); // check all internal events before view A

                // event A and view A
                cy.check_view_event(eq[7], "A", undefined, false); // no pvid
                const idA = eq[7].id; // idA
                cy.check_event(eq[8], { key: "A" }, undefined, idA); // cvid should be idA
            });
        });
    });
    it("Checks a sequence of events and page views, with end_session, with session started and called after view", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Atpl.track_sessions();
            hp.events(["[CLY]_view"]); // first events
            Atpl.track_view("A");
            Atpl.end_session(); // no view started so must be ignored
            Atpl.add_event({ key: "A" });

            Atpl.track_view("B");
            hp.events(["[CLY]_view"]);

            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(17); // orientation added
                cy.log(eq);

                cy.check_event(eq[0], { key: "[CLY]_orientation" }, undefined, ""); // internal event

                listIdChecker("", eq, 1, 7); // check all internal events before view A

                // event A and view A
                cy.check_view_event(eq[7], "A", undefined, false); // no pvid
                const idA = eq[7].id; // idA
                cy.check_view_event(eq[8], "A", 0, false); // no pvid
                cy.check_event(eq[9], { key: "A" }, undefined, idA); // cvid should be idA

                cy.check_view_event(eq[10], "B", undefined, idA); // pvid is idA
                const idB = eq[10].id; // idB
                listIdChecker(idB, eq, 11, 17); // check all internal events in view B 
            });
        });
    });
});