import { GetEndpointsRESTClient } from '../EndpointsRESTClient';
import { TestEndpoints } from '../__test__/TestEndpoints';

const Q = GetEndpointsRESTClient({} as any)(TestEndpoints)


// @dts-jest:fail:snap should not allow params with wrong type
Q.Actor.get({ id: 1 })

// @dts-jest:fail:snap should not allow call with empty params
Q.Actor.getList({ })
