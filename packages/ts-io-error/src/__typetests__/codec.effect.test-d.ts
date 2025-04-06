import { Schema } from 'effect';
import { some } from 'effect/Option';
import { assertType, describe, test } from 'vitest';
import {
  Codec,
  EncodedType,
  RecordEncoded,
  RecordSerialized,
  runtimeType,
  SerializedType,
  serializedType,
} from '../Codec';

describe('Codec', () => {
  test('Schema.String satisfies Codec<string, string>', () => {
    const stringCodec = Schema.String;
    assertType<Codec<string, string>>(stringCodec);

    assertType<Codec<number, number>>(Schema.Number);
    const numberFromStringCodec = Schema.NumberFromString;
    assertType<Codec<number, string>>(numberFromStringCodec);

    // @dts-jest:pass:snap Schema.Struct satisfies Codec
    const structCodec = Schema.Struct({
      id: Schema.NumberFromString,
      name: Schema.String,
    });

    assertType<Codec<{ id: number; name: string }, { id: string; name: string }>>(structCodec);
    // @dts-jest:pass:snap RecordEncoded
    // type RET = RecordEncoded<{ id: typeof Schema.NumberFromString; name: typeof Schema.String }>;

    const structRecordCodec = Schema.Struct({
      id: Schema.NumberFromString,
      name: Schema.String,
    });

    const optionSchema = Schema.OptionFromNullishOr(Schema.Number, null);

    // serialized type helpers
    assertType<serializedType<typeof Schema.NumberFromString>>('1');
    assertType<RecordSerialized<(typeof structCodec)['fields']>>({ id: '1', name: 'name' });
    assertType<SerializedType<typeof Schema.NumberFromString>>('1');
    assertType<SerializedType<typeof structRecordCodec>>({ id: '1', name: 'name' });

    assertType<RecordEncoded<(typeof structCodec)['fields']>>({ id: 1, name: 'name' });

    assertType<EncodedType<typeof structCodec>>({ id: 1, name: 'name' });
    assertType<EncodedType<typeof structRecordCodec>>({ id: 1, name: 'name' });
    assertType<EncodedType<typeof optionSchema>>(some(1));

    // runtime type helpers
    assertType<runtimeType<typeof optionSchema>>(some(1));
    assertType<runtimeType<typeof Schema.NumberFromString>>(1);

    // @dts-jest:pass:snap RecordCodecType
    // type RCT = RecordCodecType<typeof structRecordCodec>;

    // @dts-jest:pass:snap RecordCodecEncoded
    // type structureEncoded = RecordCodecEncoded<typeof structRecordCodec>;

    // @dts-jest:pass:snap RecordSchemaType
    // type structCodecType = RecordSchemaType<(typeof structRecordCodec)['fields']>;

    // type CODEC = Codec<{ id: string }, { id: number }>;

    // type RECORD_CODEC = RecordCodec<{ superId: CODEC }>;

    // @dts-jest:pass:snap serializedType works correctly
    // type S = serializedType<CODEC>;
    // @dts-jest:pass:snap serializedType works correctly
    // type RS = serializedType<RECORD_CODEC>;
    // @dts-jest:pass:snap runtimeType works correctly
    // type R = runtimeType<CODEC>;
    // @dts-jest:pass:snap runtimeType works correctly
    // type RR = runtimeType<RECORD_CODEC>;
  });
});
