import { APIRESTClient } from '../APIRESTClient';

describe('APIRESTClient', () => {
  it('should be defined', () => {
    const apiRESTClient = APIRESTClient({ getAuth: () => '1', url: 'http://localhost:3000' });

    expect(apiRESTClient).toBeDefined();
    // REST methods
    expect(apiRESTClient.get).toBeDefined();
    expect(apiRESTClient.post).toBeDefined();
    expect(apiRESTClient.put).toBeDefined();
    expect(apiRESTClient.delete).toBeDefined();
    expect(apiRESTClient.request).toBeDefined();

    // react-admin methods
    expect(apiRESTClient.getMany).toBeDefined();
    expect(apiRESTClient.getManyReference).toBeDefined();
    expect(apiRESTClient.getList).toBeDefined();
    expect(apiRESTClient.create).toBeDefined();
    expect(apiRESTClient.getOne).toBeDefined();
    expect(apiRESTClient.update).toBeDefined();
    expect(apiRESTClient.updateMany).toBeDefined();
    expect(apiRESTClient.deleteMany).toBeDefined();
  });
});
