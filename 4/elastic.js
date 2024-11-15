npm install @elastic/elasticsearch@8

const { Client } = require('@elastic/elasticsearch');
const client = new Client({
  node: 'https://10.255.255.254:9200/',
  auth: {
      apiKey: 'pdgSFEhcRP6DIUdMskB5bw'
  }
});

const resp = await client.info();

console.log(resp);
// API Key should have cluster monitor rights.
const resp = await client.info();

console.log(resp);
/**
{
  name: 'instance-0000000000',
  cluster_name: 'd9dcd35d12fe46dfaa28ec813f65d57b',
  cluster_uuid: 'iln8jaivThSezhTkzp0Knw',
  version: {
    build_flavor: 'default',
    build_type: 'docker',
    build_hash: 'ca3dc3a882d76f14d2765906ce3b1cf421948d19',
    build_date: '2023-08-28T11:24:16.383660553Z',
    build_snapshot: true,
    lucene_version: '9.7.0',
    minimum_wire_compatibility_version: '7.17.0',
    minimum_index_compatibility_version: '7.0.0'
  },
  tagline: 'You Know, for Search'
}
*/