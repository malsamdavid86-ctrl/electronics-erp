// core-service/database/seed.js
const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  user: 'admin',
  password: 'securepassword',
  database: 'electronics_erp'
});

async function seedProducts() {
  const categories = ['CPU', 'GPU', 'RAM', 'SSD', 'Keyboard'];
  const brands = ['AeroVolt', 'QuantumTech', 'HyperSolder', 'ApexCircuit', 'NeonMatrix'];
  
  console.log("⚡ Initializing procedural seeding for 250 hardware nodes...");

  try {
    // Ensure table exists with correct schema matching our previous setups
    await pool.query(`
      CREATE TABLE IF NOT EXISTS components (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        stock INT NOT NULL,
        specs JSONB NOT NULL
      );
    `);

    // Truncate existing components to prevent constraint pollution
    await pool.query('TRUNCATE TABLE components;');

    for (let i = 1; i <= 250; i++) {
      const category = categories[i % categories.length];
      const brand = brands[i % brands.length];
      const id = crypto.randomUUID();
      const price = parseFloat((Math.random() * (1200 - 45) + 45).toFixed(2));
      const stock = Math.floor(Math.random() * 45);
      
      let name = '';
      let specs = {};

      // Procedural generation profiles based on item category index
      switch(category) {
        case 'CPU':
          name = `${brand} Core Processor Nexus-${i}X`;
          specs = { socket: i % 2 === 0 ? "AM5" : "LGA1700", cores: (i % 8 + 1) * 2, TDP: "125W" };
          break;
        case 'GPU':
          name = `${brand} Overclocked Matrix-RTX ${i}00`;
          specs = { vram: `${(i % 4 + 1) * 4}GB`, interface: "PCIe 5.0", architecture: "CyberCore-v2" };
          break;
        case 'RAM':
          name = `${brand} Obsidian DDR5 Sync ${i}MHz`;
          specs = { capacity: `${(i % 3 + 1) * 16}GB`, latency: "CL30", rgb: i % 2 === 0 };
          break;
        case 'SSD':
          name = `${brand} Quantum NVMe M.2 Drive v${i}`;
          specs = { capacity: `${(i % 4 + 1) * 500}GB`, read_speed: "7400MB/s", gen: "PCIe Gen4" };
          break;
        case 'Keyboard':
          name = `${brand} Solderless Mechanical Deck-${i}`;
          specs = { switches: i % 2 === 0 ? "Linear Red" : "Tactile Brown", layout: "75%", hot_swappable: true };
          break;
      }

      await pool.query(
        'INSERT INTO components (id, name, category, brand, price, stock, specs) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, name, category, brand, price, stock, JSONB.stringify(specs)]
      );
    }

    console.log("✔ SUCCESS: 250 unique product entries fully committed to database.");
  } catch (err) {
    console.error("❌ SEED_FAILURE:", err);
  } finally {
    await pool.end();
  }
}

seedProducts();
