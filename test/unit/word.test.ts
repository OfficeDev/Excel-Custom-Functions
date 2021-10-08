import * as assert from "assert";
import "mocha";
import { OfficeMockObject } from "office-addin-mock";

/* global describe, global, it, require, Word */

const WordMockData = {
  context: {
    document: {
      body: {
        paragraph: {
          font: {},
          text: "",
        },
        insertParagraph: function (paragraphText: string, insertLocation: Word.InsertLocation): Word.Paragraph {
          this.paragraph.text = paragraphText;
          this.paragraph.insertLocation = insertLocation;
          return this.paragraph;
        },
      },
    },
  },
  InsertLocation: {
    end: "End",
  },
  run: async function (callback) {
    await callback(this.context);
  },
};

const OfficeMockData = {
  onReady: async function () {},
};

describe("Word", function () {
  it("Run", async function () {
    const wordMock: OfficeMockObject = new OfficeMockObject(WordMockData); // Mocking the host specific namespace
    global.Word = wordMock as any;
    global.Office = new OfficeMockObject(OfficeMockData) as any; // Mocking the common office-js namespace

    const { run } = require("../../src/taskpane/word");
    await run();

    assert.strictEqual(wordMock.context.document.body.paragraph.font.color, "blue");
  });
});
