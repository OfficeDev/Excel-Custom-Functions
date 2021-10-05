import { OfficeMockObject } from "office-addin-mock";

/* global expect, global, jest, require, Word, test */

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

test(`Word`, async function () {
  jest.resetModules(); // to make sure that require will return a new module instance
  jest.mock("./../../src/taskpane/office", () => ({ onReady: async function () {} }));
  const { run } = require("../../src/taskpane/word");

  const wordMock = new OfficeMockObject(WordMockData) as any;
  wordMock.addMockFunction("run", async function (callback) {
    await callback(wordMock.context);
  });
  global.Word = wordMock;

  await run();

  expect(wordMock.context.document.body.paragraph.font.color).toBe("blue");
});
