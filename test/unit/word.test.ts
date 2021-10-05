import { OfficeMockObject } from "office-addin-mock";
import { run } from "../../src/taskpane/word";

/* global expect, global, Word, test */

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
  const wordMock = new OfficeMockObject(WordMockData) as any;
  wordMock.addMockFunction("run", async function (callback) {
    await callback(wordMock.context);
  });
  global.Word = wordMock;

  await run();

  expect(wordMock.context.document.body.paragraph.font.color).toBe("blue");
});
