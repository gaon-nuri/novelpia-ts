type HttpStrFn = (
    type: string,
    url: string,
    data: {}
) => Promise<string>;

interface SuccCbs {
    loginCallback: Function,
}

interface ToggleStateCbs extends SuccCbs {
    authCallback: Function,
    offCallback: Function,
    onCallback: Function
}

export type {
    HttpStrFn,
    ToggleStateCbs,
};