const { CosmosClient } = require("@azure/cosmos");

// Connection string comes from Function App Application Settings,
// never hardcoded here.
const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database("ResumeDB");
const container = database.container("Counter");

module.exports = async function (context, req) {
  try {
    // Try to read the existing counter document.
    // Partition key path is /id, so the partition key value is "visitorCount".
    const { resource: existing } = await container
      .item("visitorCount", "visitorCount")
      .read()
      .catch(() => ({ resource: null }));

    let newCount;

    if (existing) {
      newCount = existing.count + 1;
      await container.item("visitorCount", "visitorCount").replace({
        id: "visitorCount",
        count: newCount
      });
    } else {
      // First-ever visit: create the document starting at 1.
      newCount = 1;
      await container.items.create({
        id: "visitorCount",
        count: newCount
      });
    }

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: { count: newCount }
    };
  } catch (err) {
    context.log.error("Counter function failed:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: "Could not update visitor count." }
    };
  }
};
