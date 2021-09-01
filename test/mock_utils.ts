export class FillMock {
  color: string;
}

class FormatMock {
  constructor() {
    this.fill = new FillMock();
  }
  fill: FillMock;
}

class Property {
  constructor(name: string) {
    this.loaded = false;
    this.name = name;
    this.value = `Error, ${name} was not loaded`;
  }

  load() {
    this.loaded = true;
    this.value = `Error, context.sync() was not called`;
  }

  sync() {
    if (this.loaded) {
      this.value = this.valueBeforeLoaded;
    }
  }

  setMock(value: string) {
    this.valueBeforeLoaded = value;
  }

  loaded: boolean;
  name: string;
  value: string;
  valueBeforeLoaded: string;
}

export class RangeMock {
  constructor() {
    this.format = new FormatMock();
    this.properties = new Map<string, Property>();
  }
  load(propertyName: string) {
    if (this.properties.has(propertyName)) {
      this.properties.get(propertyName).load();
      this[propertyName] = this.properties.get(propertyName).value;
    }
  }
  sync() {
    this.properties.forEach((property: Property, key: string) => {
      property.sync();
      this[key] = this.properties.get(key).value;
    });
  }
  setMock(propertyName: string, value: string) { // Also add runtime properties
    if (!this.properties.has(propertyName)) {
      this.properties.set(propertyName, new Property(propertyName));
      this.properties.get(propertyName).setMock(value);
      this[propertyName] = this.properties.get(propertyName).value;
    }
  }
  format: FormatMock;
  properties: Map<string, Property>;
}

export class WorkbookMock {
  constructor() {
    this.range = new RangeMock();
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
  constructor() {
    this.workbook = new WorkbookMock();
  }
  async sync(): Promise<void> {
    this.workbook.sync();
  }
  workbook: WorkbookMock;
}

export class ExcelMock {
  async run(callback): Promise<void> {
    this.context = new ContextMock();
    await callback(this.context);
  }
  context: ContextMock;
}
