// src/mixins.mts
export type Ctor<T = {}> = new (...args: any[]) => T;

export function LoggingMixin<TBase extends Ctor>(Base: TBase) {
  return class extends Base {
    log(message: string) {
      // You can swap this out with your logger
      console.log(`[${this.constructor.name}] ${message}`);
    }
  };
}
