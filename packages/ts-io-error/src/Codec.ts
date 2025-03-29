// -------------------------------------------------------------------------------------
// Codec
// -------------------------------------------------------------------------------------

export interface Codec<A, B = A, R = never> {
  Type: A;
  Encoded: B;
  Context: R;
}

// type AnyOrRuntime<N> = [N] extends [never]
//   ? any
//   : N extends Record<any, Codec<any, any>>
//   ? { [k in keyof N]: runtimeType<N[k]> }
//   : never;

export type UndefinedsToPartial<R> = R extends Record<string, any>
  ? { [K in keyof R as undefined extends R[K] ? K : never]?: R[K] } & {
      [K in keyof R as undefined extends R[K] ? never : K]: R[K];
    }
  : R;

// serialized
export type serializedType<C> = C extends Codec<any, infer A> ? A : never;
export type RecordSerialized<N> = N extends Record<string, Codec<any>>
  ? { [K in keyof N]: serializedType<N[K]> }
  : never;

export type RecordCodecSerialized<N> = N extends RecordCodec<infer A> ? RecordSerialized<A> : never;

export type SerializedType<N> = N extends RecordCodec<infer A>
  ? RecordCodecSerialized<A>
  : N extends Codec<any, any>
  ? serializedType<N>
  : N extends Record<string, Codec<any>>
  ? RecordSerialized<N>
  : unknown;

// encoded
export type runtimeType<C> = C extends Codec<infer B, any> ? B : never;

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

export type PartialRecordEncoded<N> = N extends Record<string, Codec<any>>
  ? UndefinedsToPartial<RecordEncoded<N>> | undefined
  : never;

export interface RecordCodec<A extends Record<string, Codec<any>>>
  extends Codec<RecordSerialized<A>, RecordEncoded<A>> {
  fields: A;
}

export type RecordCodecEncoded<N> = N extends RecordCodec<infer B> ? RecordEncoded<B> : never;

export type PartialRuntimeType<N> = N extends Codec<any, any>
  ? UndefinedsToPartial<runtimeType<N>>
  : never;

export type PartialSerializedType<N> = N extends Codec<any, any>
  ? UndefinedsToPartial<serializedType<N>>
  : never;
