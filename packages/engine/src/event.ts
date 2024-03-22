type Events = Record<string, any>;

type Hook<T extends Events> = keyof T | (string & {}); // little hack to allow untyped string to be passed

type HandlerParams<T extends Events, H extends Hook<T>> = T[H];

type Handler<T extends Events, H extends Hook<T>> = (
  params: HandlerParams<T, H>,
) => void;

type Handlers<T extends Events> = {
  [H in Hook<T>]: Set<Handler<T, H>>;
};

export type EventEmitter<T extends Events> = ReturnType<
  typeof createEventEmitter<T>
>;

export function createEventEmitter<T extends Events>() {
  const events: Handlers<T> = {} as Handlers<T>;

  function on<H extends Hook<T>>(hook: H, cb: Handler<T, H>) {
    events[hook] ??= new Set<Handler<T, H>>();

    events[hook].add(cb);

    return () => off(hook, cb);
  }

  function once<H extends Hook<T>>(hook: H, cb: Handler<T, H>) {
    const handler: Handler<T, H> = (params) => {
      cb(params);
      off(hook, handler);
    };

    on(hook, handler);
  }

  function off<H extends Hook<T>>(hook: H, cb: Handler<T, H>) {
    return events[hook].delete(cb);
  }

  function emit<H extends Hook<T>>(hook: H, params?: HandlerParams<T, H>) {
    for (const cb of events[hook].values()) {
      cb(params as HandlerParams<T, H>);
    }
  }

  return { on, once, off, emit };
}
