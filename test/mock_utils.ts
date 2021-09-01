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

  addMockFunction(methodName: string, functionality?: Function) {
    this[methodName] = functionality ? functionality : function () {}
  }

  addMockObject(objectName: string) {
    this.properties.set(objectName, new OfficeJSMock(objectName, true));
    this[objectName] = this.properties.get(objectName);
  }

  setMock(propertyName: string, value: string) {
    if (!this.properties.has(propertyName)) {
        this.properties.set(propertyName, new OfficeJSMock(propertyName, false));
        this.properties.get(propertyName)._setValue(value);
        this[propertyName] = this.properties.get(propertyName).value;
    }
  }

  _assignValue(propertyName: string) {
    if (this.properties.get(propertyName).isObject) {
      this[propertyName] = this.properties.get(propertyName);
    } else {
      this[propertyName] = this.properties.get(propertyName).value;
    }
  }

  _setValue(value: string) {
    this.valueBeforeLoaded = value;
  }

  properties: Map<string, OfficeJSMock>;
  loaded: boolean;
  name: string;
  value: string;
  valueBeforeLoaded: string;
  isObject: boolean;
}
