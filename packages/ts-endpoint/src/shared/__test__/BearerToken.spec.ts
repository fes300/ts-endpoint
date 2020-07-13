import { BearerToken } from '../BearerToken';

describe('BearerToken', () => {
  it('well formatted BearerToken should pass validation', () => {
    const jwtToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const header = { Authorization: `Bearer ${jwtToken}` };
    const result = BearerToken.decode(header.Authorization);
    expect(result._tag).toEqual('Right');
  });
  it('wrongly formatted BearerToken should NOT pass validation', () => {
    const jwtToken = 'some strange token';
    const header = { Authorization: `Bearer ${jwtToken}` };
    const result = BearerToken.decode(header.Authorization);
    expect(result._tag).toEqual('Left');
  });
  it('omitting "Bearer" in the header should make validation fail', () => {
    const jwtToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const header = { Authorization: `${jwtToken}` };
    const result = BearerToken.decode(header.Authorization);
    expect(result._tag).toEqual('Left');
  });
});
