import { GET } from '../src/app/api/status/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => {
      return {
        status: init?.status || 200,
        json: async () => body
      };
    })
  }
}));

describe('Status API Endpoint', () => {
  it('should return a 200 status and correct payload', async () => {
    const response = await GET();
    
    // Check Status code
    expect(response.status).toBe(200);

    // Read payload
    const data = await response.json();
    
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('message', 'Smart Stadium API is running');
    expect(data).toHaveProperty('timestamp');
  });
});
