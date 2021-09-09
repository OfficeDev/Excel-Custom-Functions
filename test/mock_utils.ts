export class OfficeJSMock {
  constructor(name?: string, isObject?: boolean) {
    this._properties = new Map<string, OfficeJSMock>();
    this._loaded = false;
    this._name = name;
    this._value = `Error, ${name} was not loaded`;
    this._isObject = isObject;
  }

  addMockFunction(methodName: string, functionality?: Function) {
    this[methodName] = functionality ? functionality : function () {}
  }

  addMockObject(objectName: string) {
    this._properties.set(objectName, new OfficeJSMock(objectName, true));
    this[objectName] = this._properties.get(objectName);
  }

  load(propertyName?: string) {
    if (this._properties.has(propertyName)) {
      this._properties.get(propertyName).load();
      this._assignValue(propertyName);
    }
    this._loaded = true;
    this._value = `Error, context.sync() was not called`;
  }

  populate(json) {
    Object.keys(json).forEach((property: string) => {
      if (typeof json[property] === "object") {
        this.addMockObject(property);
        this[property].populate(json[property]);
      } else {
        this.setMock(property, json[property]);
      }
    });
  }

  setMock(propertyName: string, value: unknown) {
    if (!this._properties.has(propertyName)) {
      this._properties.set(propertyName, new OfficeJSMock(propertyName, false));
      this._properties.get(propertyName)._setValue(value);
      this[propertyName] = this._properties.get(propertyName)._value;
    }
  }

  sync() {
    this._properties.forEach((property: OfficeJSMock, key: string) => {
      property.sync();
      this._assignValue(key);
    });
    if (this._loaded) {
      this._value = this._valueBeforeLoaded;
    }
  }

  _assignValue(propertyName: string) {
    if (this._properties.get(propertyName)._isObject) {
      this[propertyName] = this._properties.get(propertyName);
    } else {
      this[propertyName] = this._properties.get(propertyName)._value;
    }
  }

  _setValue(value: unknown) {
    this._valueBeforeLoaded = value;
  }

  _properties: Map<string, OfficeJSMock>;
  _loaded: boolean;
  _name: string;
  _value: unknown;
  _valueBeforeLoaded: unknown;
  _isObject: boolean;
}
