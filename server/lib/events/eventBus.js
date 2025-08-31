import { EventEmitter } from "events";

export class EventBus {
  constructor() {
    this.emitter = new EventEmitter();
  }

  on(event, handler) {
    this.emitter.on(event, handler);
  }

  emit(event, data) {
    this.emitter.emit(event, data);
  }
}
