import { pipe } from 'fp-ts/lib/function';
import { MinimalEndpointInstance } from 'ts-endpoint';
import { serializedType } from 'ts-io-error/lib/Codec';
import * as E from 'fp-ts/Either';

interface DecodeResponseSuccess<E extends MinimalEndpointInstance> {
  type: 'success';
  result: serializedType<E['Output']>;
}

type DecodeResponseResult<EI extends MinimalEndpointInstance, E> =
  | { type: 'error'; result: E }
  | DecodeResponseSuccess<EI>;

export const decode = <EI extends MinimalEndpointInstance, E>(
  e: EI,
  toError: (e: any) => E,
  result: any
): DecodeResponseResult<EI, E> => {
  return pipe(
    e.Output.decode(result),
    E.fold(
      (e): DecodeResponseResult<EI, E> => ({
        type: 'error',
        result: toError(e),
      }),
      (result): DecodeResponseSuccess<EI> => ({ type: 'success', result })
    )
  );
};

const ResponseDecoder = { decode };

export default ResponseDecoder;
