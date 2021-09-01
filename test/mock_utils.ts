export class OfficeJSMock {
  constructor(name?: string, isObject?: boolean) {
    this.properties = new Map<string, OfficeJSMock>();
  
    this.loaded = false;
    this.name = name;
    this.value = `Error, ${name} was not loaded`;

    this.isObject = isObject;
  }
  load(propertyName?: string) {
    if (this.properties.has(propertyName)) {
      this.properties.get(propertyName).load();
      this._assignValue(propertyName);
    }
    this.loaded = true;
    this.value = `Error, context.sync() was not called`;
  }
  sync() {
    this.properties.forEach((property: OfficeJSMock, key: string) => {
      property.sync();
      this._assignValue(key);
    });
    if (this.loaded) {
      this.value = this.valueBeforeLoaded;
    }
  }

  _assignValue(propertyName: string) {
    if (this.properties.get(propertyName).isObject) {
      this[propertyName] = this.properties.get(propertyName);
    } else {
      this[propertyName] = this.properties.get(propertyName).value;
    }
  }

  addMockFunction(methodName: string) {
    this[methodName] = function () {}
  }

  addMockObject(objectName: string) {
    this.properties.set(objectName, new OfficeJSMock(objectName, true));
    this[objectName] = this.properties.get(objectName);
  }

  _setValue(value: string) {
    this.valueBeforeLoaded = value;
  }

  setMock(propertyName: string, value: string) {
    if (!this.properties.has(propertyName)) {
        this.properties.set(propertyName, new OfficeJSMock(propertyName, false));
        this.properties.get(propertyName)._setValue(value);
        this[propertyName] = this.properties.get(propertyName).value;
    }
  }

  properties: Map<string, OfficeJSMock>;

  loaded: boolean;
  name: string;
  value: string;
  valueBeforeLoaded: string;
  isObject: boolean;
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


export class RangeMock extends OfficeJSMock {

}


export class FillMock {
  color: string;
}

class FormatMock {
  constructor() {
    this.fill = new FillMock();
  }
  fill: FillMock;
}







class Range2 extends RangeMock {

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
