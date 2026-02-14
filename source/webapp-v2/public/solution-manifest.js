// Development placeholder — replaced at deploy time
window.SolutionManifest = {
  Region: 'us-east-1',
  ApiEndpoint: 'https://localhost:3001',
  ApiOps: {},
  Cognito: {
    UserPoolId: 'us-east-1_XXXXXXXXX',
    ClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    IdentityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    Group: { Viewer: 'Viewer', Creator: 'Creator', Admin: 'Admin' },
  },
  IotHost: 'xxxxxxxxxx.iot.us-east-1.amazonaws.com',
  IotTopic: 'm2c/status',
  Ingest: { Bucket: 'dev-ingest-bucket' },
  Proxy: { Bucket: 'dev-proxy-bucket' },
  S3: { ExpectedBucketOwner: '000000000000' },
};
