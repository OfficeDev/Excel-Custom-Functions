import { OfficeMockObject } from "office-addin-mock";

/* global expect, global, require, Word, test */

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

test(`Word`, async function () {
  const wordMock: OfficeMockObject = new OfficeMockObject(WordMockData);
  global.Word = wordMock as any;
  global.Office = new OfficeMockObject(OfficeMockData) as any;

  const { run } = require("../../src/taskpane/word");
  await run();

  expect(wordMock.context.document.body.paragraph.font.color).toBe("blue");
});
