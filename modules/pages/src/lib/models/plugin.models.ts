import { AttributeValue } from '@rollthecloudinc/attributes';
import { Param } from '@rollthecloudinc/dparam';

export class DataSlice {
  context: string;
  query: string;
  plugin: string;
  constructor(data?: DataSlice) {
    if(data) {
      this.context = data.context;
      this.query = data.query;
      this.plugin = data.plugin;
    }
  }
}

export class QButton {
  text: string;
  action?: string;
  appearance?: string;
  paramsString?: string;
  params?: Array<Param>;
  constructor(data?: QButton) {
    if (data) {
      this.text = data.text;
      this.action = data.action
      this.appearance = data.appearance
      this.paramsString = data.paramsString;
      this.params = data.params ? data.params.map(p => new Param(p)) : [];
    }
  }
}

export class MenuItem {
  iconName: string;
  text: string;
  action?: string;
  constructor(data?: MenuItem) {
    if (data) {
      this.iconName = data.iconName
      this.text = data.text
      this.action = data.action
    }
  }
}

export class QMenu {
  label: string;
  iconName: string;
  items: Array<MenuItem> = []
  constructor(data?: QMenu) {
    if (data) {
      this.label = data.label
      this.iconName = data.iconName
      if (data.items) {
        this.items = data.items.map(i => new MenuItem(i))
      }
    }
  }
}

export class QLink {
  text: string
  url: string
  appearance?: string;
  constructor(data?: QLink) {
    if (data) {
      this.text = data.text
      this.url = data.url
      this.appearance = data.appearance
    }
  }
}

export class QIcon {
  iconName: string;
  label?: string;
  category: string;
  constructor(data?: QIcon) {
    if (data) {
      this.iconName = data.iconName
      this.label = data.label
      this.category = data.category
    }
  }
}

export class Sidenav {
  width?: number;
  mode: 'side' | 'over' | 'push' = 'side';
  position: 'start' | 'end' = 'start';
  opened: boolean = true;

  constructor(data?: Partial<Sidenav>) {
    Object.assign(this, data);
  }
}

export class IconButton {
  iconName: string;
  ariaLabel?: string;
  action?: string;

  constructor(data?: IconButton) {
    if (data) {
      this.iconName = data.iconName;
      this.ariaLabel = data.ariaLabel;
      this.action = data.action;
    }
  }
}

export class Fab {
  iconName: string;
  ariaLabel?: string;
  action?: string;
  text?: string;
  minifab?: boolean;

  constructor(data?: Fab) {
    if (data) {
      this.iconName = data.iconName;
      this.ariaLabel = data.ariaLabel;
      this.action = data.action;
      this.text = data.text
      this.minifab = data.minifab;
    }
  }
}

/*export class SelectOption {
  value: AttributeValue;
  label: string;
  dataItem: any;
  constructor(data?: SelectOption) {
    if(data) {
      this.label = data.label;
      this.dataItem = data.dataItem;
      if(data.value !== undefined) {
        this.value = new AttributeValue(data.value);
      }
    }
  }
}*/

/*export class SelectMapping {
  value: string;
  label: string;
  id: string;
  multiple: boolean;
  limit: number;
  constructor(data?: SelectMapping) {
    if(data) {
      this.value = data.value;
      this.label = data.label;
      this.id = data.id;
      this.multiple = data.multiple;
      this.limit = data.limit;
    }
  }
}*/
