export class FillMock {
    color: string;
  }
  
class FormatMock {
  constructor() {
    this.fill = new FillMock();
  }
  fill: FillMock;
}

export class RangeMock {
  constructor(address: string) {
    this.loaded = false;
    this.address = "error, address was not loaded";
    this.addressBeforeLoad = address;
    this.format = new FormatMock();
  }
  load() {
    this.loaded = true;
    this.address = "error, context.sync was not called";
  }
  sync() {
    if (this.loaded) {
      this.address = this.addressBeforeLoad;
    }
  }
  address: string;
  addressBeforeLoad: string;
  loaded: boolean;
  format: FormatMock;
}

export class WorkbookMock {
  constructor(address: string) {
    this.range = new RangeMock(address);
  }
  getSelectedRange(): RangeMock {
    return this.range;
  }
  sync(): void {
    this.range.sync();
  }
  range: RangeMock;
}

export class ContextMock {
  constructor(address: string) {
    this.workbook = new WorkbookMock(address);
  }
  async sync(): Promise<void> {
    this.workbook.sync();
  }
  workbook: WorkbookMock;
}

export class ExcelMock {
  async run(callback): Promise<void> {
    this.context = new ContextMock("G5");
    await callback(this.context);
  }
  context: ContextMock;
}
