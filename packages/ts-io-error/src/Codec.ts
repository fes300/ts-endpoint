//-------------------------------------------------------------------------------------
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
// IO TS
// -------------------------------------------------------------------------------------
export interface ValidationError {
  /** the offending (sub)value */
  readonly value: unknown;
  /** where the error originated */
  readonly context: any;
  /** optional custom error message */
  readonly message?: string;
}

// -------------------------------------------------------------------------------------
// Codec
// -------------------------------------------------------------------------------------

export interface EffectCodec<A, B = A, R = never> {
  Type: A;
  Encoded: B;
  Context: R;
}

export interface IOTSCodec<A, B> {
  encode: (b: B) => A;
  decode: (b: unknown) => Either<ValidationError[], B>;
}

export type Codec<A, B = A, R = never> = EffectCodec<A, B, R> | IOTSCodec<A, B>;

export type InferCodec<C> = C extends IOTSRecordCodec<infer A, infer B>
  ? IOTSRecordCodec<A, B>
  : C extends EffectRecordCodec<infer A>
  ? EffectRecordCodec<A>
  : C extends IOTSCodec<infer A, infer B>
  ? IOTSCodec<A, B>
  : C extends EffectCodec<infer A, infer B, infer R>
  ? EffectCodec<A, B, R>
  : never;

// type AnyOrRuntime<N> = [N] extends [never]
//   ? any
//   : N extends Record<any, Codec<any, any>>
//   ? { [K in keyof N]: runtimeType<N[K]> }
//   : never;

export type UndefinedsToPartial<R> = R extends Record<string, any>
  ? { [K in keyof R as undefined extends R[K] ? K : never]?: R[K] } & {
      [K in keyof R as undefined extends R[K] ? never : K]: R[K];
    }
  : R;

// serialized
export type serializedType<C> = C extends IOTSRecordCodec<any, infer B>
  ? { [K in keyof B]: serializedType<B[K]> }
  : C extends EffectCodec<any, infer A>
  ? A
  : C extends IOTSCodec<infer A, any>
  ? A
  : never;

export type RecordSerialized<N> = N extends Record<string, Codec<any>>
  ? { [K in keyof N]: serializedType<N[K]> }
  : never;

export type RecordCodecSerialized<N> = N extends IOTSRecordCodec<any, any>
  ? IOTSRecordSerialized<N>
  : N extends EffectRecordCodec<infer A>
  ? RecordSerialized<A>
  : never;

export type SerializedType<N> = N extends RecordCodec<infer A>
  ? RecordCodecSerialized<A>
  : N extends Codec<any, any>
  ? serializedType<N>
  : N extends Record<string, Codec<any>>
  ? RecordSerialized<N>
  : unknown;

// encoded
export type runtimeType<C> = C extends IOTSRecordCodec<any, any>
  ? IOTSRecordEncoded<C>
  : C extends IOTSCodec<any, infer B>
  ? B
  : C extends IOTSRecordCodec<any, infer B>
  ? B
  : C extends EffectCodec<infer B, any>
  ? B
  : never;

export type RecordEncoded<N> = N extends Record<string, Codec<any>>
  ? { [K in keyof N]: runtimeType<N[K]> }
  : never;

export type EncodedType<N> = N extends Codec<any, any>
  ? runtimeType<N>
  : N extends RecordCodec<infer A>
  ? RecordEncoded<A>
  : N extends Record<string, Codec<any>>
  ? RecordEncoded<N>
  : unknown;

export type AnyOrRuntime<N> = [N] extends [never] ? { [K in keyof N]: runtimeType<N[K]> } : never;

export interface EffectRecordCodec<A extends Record<string, Codec<any>>>
  extends EffectCodec<RecordSerialized<A>, RecordEncoded<A>> {
  fields: A;
}

export interface IOTSRecordCodec<A, B extends Record<any, Codec<any, any, any>> = never>
  extends IOTSCodec<A, RecordEncoded<B>> {
  // encode: (b: { [K in keyof B]: runtimeType<B[K]> }) => A;
  encode: (b: B) => A;
  decode: (b: unknown) => Either<ValidationError[], RecordEncoded<B>>;
  props: RecordEncoded<B>;
}

export type IOTSRecordEncoded<N> = N extends IOTSRecordCodec<any, any>
  ? { [K in keyof N['props']]: runtimeType<N['props'][K]> }
  : never;

export type IOTSRecordSerialized<N> = N extends IOTSRecordCodec<any, any>
  ? { [K in keyof N['props']]: serializedType<N['props'][K]> }
  : never;

export type RecordCodec<A extends Record<string, Codec<any>>> =
  | EffectRecordCodec<A>
  | IOTSRecordCodec<A, A>;

export type InferRecordCodec<C> = C extends { type: { props: Record<string, Codec<any>> } }
  ? IOTSRecordCodec<RecordSerialized<C['type']['props']>, RecordEncoded<C['type']['props']>>
  : C extends IOTSRecordCodec<infer A, infer B>
  ? IOTSRecordCodec<A, B>
  : C extends EffectRecordCodec<infer A>
  ? EffectRecordCodec<A>
  : never;

export type RecordCodecEncoded<N> = N extends RecordCodec<infer B> ? RecordEncoded<B> : never;

export type PartialSerializedType<N> = N extends Codec<any, any>
  ? UndefinedsToPartial<serializedType<N>>
  : never;

export type decodeType<C> = C extends IOTSRecordCodec<any, any>
  ? Either<ValidationError[], IOTSRecordEncoded<C>>
  : never;

export type UndefinedOrRuntime<N> = N extends undefined ? undefined : EncodedType<N>;

export type UndefinedOrType<N> = N extends IOTSRecordCodec<any, any>
  ? IOTSRecordSerialized<N>
  : N extends EffectRecordCodec<any>
  ? RecordCodecSerialized<N>
  : undefined;
