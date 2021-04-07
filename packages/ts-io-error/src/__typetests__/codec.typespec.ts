import {
  Codec,
  decodeType,
  errorType,
  RecordCodec,
  runtimeType,
  serializedType,
} from '../../lib/Codec';

type CODEC = Codec<string, { id: string }, { id: number }>;
type RECORD_CODEC = RecordCodec<string, { id: string }, { superId: CODEC }>;
// @dts-jest:pass:snap typeconstructor works correctly
type D = decodeType<CODEC>;
// @dts-jest:pass:snap typeconstructor works correctly
type RD = decodeType<RECORD_CODEC>;
// @dts-jest:pass:snap typeconstructor works correctly
type S = serializedType<CODEC>;
// @dts-jest:pass:snap typeconstructor works correctly
type RS = serializedType<RECORD_CODEC>;
// @dts-jest:pass:snap typeconstructor works correctly
type R = runtimeType<CODEC>;
// @dts-jest:pass:snap typeconstructor works correctly
type RR = runtimeType<RECORD_CODEC>;
// @dts-jest:pass:snap typeconstructor works correctly
type E = errorType<CODEC>;
// @dts-jest:pass:snap typeconstructor works correctly
type RE = errorType<RECORD_CODEC>;
