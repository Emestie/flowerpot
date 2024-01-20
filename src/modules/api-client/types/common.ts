export interface IValue<T> extends Errorful {
    count: number;
    value: T;
}

export interface Errorful {
    errorCode?: number;
    message?: string;
}
