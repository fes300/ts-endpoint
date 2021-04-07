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

type AnyOrRuntime<N> = [N] extends [never]
  ? any
  : N extends Record<any, Codec<any, any, any>>
  ? { [k in keyof N]: runtimeType<N[k]> }
  : never;

type RecordRuntime<N> = N extends Record<any, Codec<any, any, any>>
  ? { [k in keyof N]: runtimeType<N[k]> }
  : never;

export interface RecordCodec<E, A, B extends Record<any, Codec<any, any, any>> = never>
  extends Codec<E, A, RecordRuntime<B>> {
  encode: (b: { [k in keyof B]: runtimeType<B[k]> }) => A;
  decode: (b: unknown) => Either<E, AnyOrRuntime<B>>;
  props: AnyOrRuntime<B>;
}

export type decodeType<C> = C extends Codec<infer E, any, infer B> ? Either<E, B> : never;
export type serializedType<C> = C extends Codec<any, infer A, any> ? A : never;
export type runtimeType<C> = C extends Codec<any, any, infer B> ? B : never;
export type errorType<C> = C extends Codec<infer B, any, any> ? B : never;
