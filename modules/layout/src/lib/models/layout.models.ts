import { Plugin } from 'plugin';

export class LayoutPlugin<T = string> extends Plugin<T>  {
  constructor(data?: LayoutPlugin<T>) {
    super(data)
  }
}
