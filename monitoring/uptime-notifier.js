// monitoring/uptime-notifier.js
const WEBHOOK_URL = process.env.SYSTEM_ALERT_WEBHOOK; // Pull secret secure destination from system environment
const HOST_URL = process.env.PRODUCTION_URL || "http://localhost";

async function dispatchIncidentAlert(serviceName, errorMessage) {
  if (!WEBHOOK_URL) {
    console.error(`🚨 ALERT_DISPATCH_FAILURE: Webhook URL unassigned. Context: ${serviceName} -> ${errorMessage}`);
    return;
  }

  const payload = {
    username: "Platform Monitor Bot",
    avatar_url: "https://i.imgur.com/w8W3T3b.png", // Cyber-themed indicator icon
    content: `🚨 **CRITICAL_SYSTEM_DEGRADATION_ALERT** 🚨`,
    embeds: [{
      title: `NODE_OUTAGE // ${serviceName.toUpperCase()}`,
      description: `The automated uptime monitoring matrix has detected an unresolvable routing loop or connection refusal step.`,
      color: 15158332, // Structural Hex Red alert marker
      fields: [
        { name: "Target URL Endpoint", value: HOST_URL, inline: true },
        { name: "Failure Telemetry Log", value: `\`\`\`${errorMessage}\`\`\``, inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("✔ Incident report routed successfully to communications grid.");
  } catch (err) {
    console.error("❌ WEBHOOK_TRANSPORT_FAULT: Could not reach communication servers:", err.message);
  }
}

async function executeHeartbeatCheck() {
  console.log("📡 Pinging primary cluster edge layer...");
  
  try {
    // Probe 1: Edge Access Challenge
    const edgeCheck = await fetch(`${HOST_URL}/health`);
    if (edgeCheck.status !== 200) {
      throw new Error(`EDGE_GATEWAY_HTTP_STATUS_${edgeCheck.status}`);
    }

    // Probe 2: Internal Microservice & Database Logic Challenge
    const dbMatrixCheck = await fetch(`${HOST_URL}/api/core/verify-build-compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedPartIds: [] })
    });

    if (dbMatrixCheck.status !== 200) {
      throw new Error(`CORE_SERVICE_OR_POSTGRES_DISCONNECTED_HTTP_${dbMatrixCheck.status}`);
    }

    console.log("💚 Heartbeat stable. Cluster operational matrices compliant.");
  } catch (error) {
    console.error(`⚡ FAULT_DETECTED: ${error.message}`);
    await dispatchIncidentAlert("Core Architecture Mesh", error.message);
  }
}

// Execute evaluation immediately when script fires
executeHeartbeatCheck();
