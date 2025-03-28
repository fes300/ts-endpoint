import * as E from 'fp-ts/lib/Either';
import { assertType, test } from 'vitest';
import { Codec, decodeType, errorType, RecordCodec, runtimeType, serializedType } from '../Codec';

test('Codec', () => {
  type CODEC = Codec<string, { id: string }, { id: number }>;
  type RECORD_CODEC = RecordCodec<string, { id: string }, { superId: CODEC }>;

  assertType<decodeType<CODEC>>(E.right({ id: 1 }));
  assertType<decodeType<RECORD_CODEC>>(E.right({ id: 1, superId: { id: 1 } }));

  assertType<serializedType<CODEC>>({ id: '1' });

  assertType<serializedType<RECORD_CODEC>>({ id: '1' });

  assertType<runtimeType<CODEC>>({ id: 1 });

  assertType<runtimeType<RECORD_CODEC>>({ superId: { id: 1 } });

  assertType<errorType<CODEC>>('Error');

  assertType<errorType<RECORD_CODEC>>('Error');
});
