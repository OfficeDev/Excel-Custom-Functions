import { OfficeMockObject } from "office-addin-mock";

/* global expect, global, jest, Word, test */

namespace Office {
  export function onReady() {}
}
(global as any).Office = Office;

import { run } from "../../src/taskpane/word";

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

  const wordMock: OfficeMockObject = new OfficeMockObject(WordMockData);
  wordMock.addMockFunction("run", async function (callback) {
    await callback(wordMock.context);
  });
  global.Word = wordMock as any;

  await run();

  expect(wordMock.context.document.body.paragraph.font.color).toBe("blue");
});
