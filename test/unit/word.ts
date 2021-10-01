import * as assert from "assert";
import { OfficeMockObject } from "office-addin-mock";
import { run, runOnReady } from "../../src/taskpane/word";

/* global describe, global, it, Word */

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
};

describe(`Word`, function () {
  it("Run", async function () {
    const wordMock = new OfficeMockObject(WordMockData) as any;
    wordMock.addMockFunction("run", async function (callback) {
      await callback(wordMock.context);
    });
    global.Word = wordMock;

    await run();

    assert.strictEqual(wordMock.context.document.body.paragraph.font.color, "blue");
  });
  it("runOnReady", async function () {
    // Test code for the runOnReady function
    runOnReady();
  });
});
