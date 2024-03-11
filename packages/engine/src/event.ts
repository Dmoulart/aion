type Events = Record<string, any>;

type Hook<T extends Events> = keyof T;

type HandlerParams<T extends Events, N extends Hook<T>> = T[N];

type Handler<T extends Events, N extends Hook<T>> = (
  params: HandlerParams<T, N>,
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
    on(hook, (params) => {
      cb(params);
      off(hook, cb);
    });
  }

  function off<Name extends Hook<T>>(hook: Name, cb: Handler<T, Name>) {
    events[hook].delete(cb);
  }

  function emit<H extends Hook<T>>(hook: H, params?: HandlerParams<T, H>) {
    for (const cb of events[hook].values()) {
      cb(params as HandlerParams<T, H>);
    }
  }

  return { on, once, off, emit };
}
