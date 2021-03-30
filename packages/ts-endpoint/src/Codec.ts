// -------------------------------------------------------------------------------------
// fp-ts data structures
// -------------------------------------------------------------------------------------

interface Left<E> {
  readonly _tag: 'Left';
  readonly left: E;
}

interface Right<A> {
  readonly _tag: 'Right';
  readonly right: A;
}

declare type Either<E, A> = Left<E> | Right<A>;

// -------------------------------------------------------------------------------------
// Codec
// -------------------------------------------------------------------------------------

export interface Codec<E, A, B> {
  encode: (b: B) => A;
  decode: (b: unknown) => Either<E, B>;
}

export type decodeType<C> = C extends Codec<infer E, any, infer B> ? Either<E, B> : never;
export type runtimeType<C> = C extends Codec<any, any, infer B> ? B : never;
export type errorType<C> = C extends Codec<infer B, any, any> ? B : never;
