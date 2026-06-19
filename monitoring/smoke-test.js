// monitoring/smoke-test.js
const assert = require('assert').strict;

async function verifyClusterIntegrity() {
  console.log("🚀 Running production cluster integration smoke test...");
  const EDGE_GATEWAY = process.env.PRODUCTION_URL || "http://localhost";

  try {
    // Test 1: Verify the Nginx Gateway successfully routes to the Public Customer Portal
    console.log("→ Verifying public frontend accessibility path...");
    const frontendRes = await fetch(`${EDGE_GATEWAY}/`);
    assert.equal(frontendRes.status, 200, "EDGE_GATEWAY: Customer portal root returned invalid status.");

    // Test 2: Verify the transactional pipeline executes properly through Postgres and Redis
    console.log("→ Injecting a mock compatibility packet into the core validator path...");
    const payload = { selectedPartIds: ["e1b2c3d4-0001-11e1-9999-111111111111"] };
    
    const apiRes = await fetch(`${EDGE_GATEWAY}/api/core/verify-build-compatibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(apiRes.status, 200, "GATEWAY_ROUTING_FAULT: Core checker endpoint unreachable.");
    
    const apiData = await apiRes.json();
    assert.equal(typeof apiData.valid, 'boolean', "PAYLOAD_CORRUPTION: Response missing schema format flags.");
    assert(Array.isArray(apiData.pipeline_logs), "PAYLOAD_CORRUPTION: Response logs array missing.");

    console.log("✅ CLUSTER_INTEGRITY_PASS: Every container layer responded perfectly.");
    process.exit(0);

  } catch (err) {
    console.error("❌ CLUSTER_INTEGRITY_FAIL: Operational degradation detected!");
    console.error(err.message);
    process.exit(1);
  }
}

verifyClusterIntegrity();
