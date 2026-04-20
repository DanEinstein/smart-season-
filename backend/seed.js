import { query } from './api/lib/db.js';

async function seed() {
  try {
    console.log('Seeding database...');

    // Clear fields data only (keep real users)
    await query('DELETE FROM field_updates');
    await query('DELETE FROM fields');

    // Get existing users
    const usersRes = await query("SELECT id, role FROM users ORDER BY created_at ASC");
    const users = usersRes.rows;

    if (users.length === 0) {
      console.log('No users found. Please log in first, then run seed.');
      process.exit(1);
    }

    const admin = users.find(u => u.role === 'admin') || users[0];
    const agents = users.filter(u => u.role === 'agent');
    const agent1 = agents[0]?.id || admin.id;
    const agent2 = agents[1]?.id || admin.id;

    console.log(`Using admin: ${admin.id}, agent1: ${agent1}, agent2: ${agent2}`);

    const fieldsRes = await query(`
      INSERT INTO fields (name, crop_type, planting_date, current_stage, assigned_agent_id, created_by) VALUES
      ('North Plot A', 'Maize', '2026-01-15', 'growing', $1, $3),
      ('South Valley B', 'Wheat', '2025-11-20', 'harvested', $1, $3),
      ('East Ridge C', 'Soybeans', '2026-04-01', 'planted', $2, $3),
      ('West Field D', 'Barley', '2026-03-10', 'growing', $2, $3),
      ('Central Zone E', 'Rice', '2025-12-05', 'ready', $1, $3),
      ('Delta Patch F', 'Maize', '2026-02-28', 'growing', $1, $3)
      RETURNING id, name
    `, [agent1, agent2, admin.id]);

    const fields = fieldsRes.rows;
    console.log(`Created ${fields.length} fields`);

    // Add some updates to first 3 fields
    for (const field of fields.slice(0, 3)) {
      await query(`
        INSERT INTO field_updates (field_id, updated_by, stage, notes) VALUES
        ($1, $2, 'growing', 'Crop is developing well. Soil moisture optimal.'),
        ($1, $2, 'planted', 'Initial planting completed. Seeds sown uniformly.')
      `, [field.id, agent1]);
    }

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
