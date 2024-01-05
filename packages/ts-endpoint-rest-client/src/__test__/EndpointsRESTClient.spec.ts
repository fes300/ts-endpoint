import { mock } from 'jest-mock-extended';
import { type APIRESTClient } from '../APIRESTClient';
import { GetEndpointsRESTClient } from '../EndpointsRESTClient';
import { TestEndpoints } from './TestEndpoints';

describe('EndpointsRESTClient', () => {
  const apiRESTClient = mock<APIRESTClient>();
  const apiClient = GetEndpointsRESTClient(apiRESTClient)(TestEndpoints);
  it('should be defined', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.Actor.get).toBeDefined();
    expect(apiClient.Actor.getList).toBeDefined();
    expect(apiClient.Actor.Custom.GetSiblings).toBeDefined();
  });
});
