export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = process.env.CLICKUP_TOKEN;
  if (!token) return res.status(500).json({ error: 'CLICKUP_TOKEN not set' });

  const { range = 'this_week', start, end, client, employee } = req.query;

  try {
    const teamRes = await fetch('https://api.clickup.com/api/v2/team', {
      headers: { Authorization: token }
    });
    const teamData = await teamRes.json();
    const teamId = teamData.teams[0].id;

    const { startMs, endMs } = getRange(range, start, end);

    const entriesRes = await fetch(
      `https://api.clickup.com/api/v2/team/${teamId}/time_entries?start_date=${startMs}&end_date=${endMs}&include_task_tags=true`,
      { headers: { Authorization: token } }
    );
    const entriesData = await entriesRes.json();
    const entries = entriesData.data || [];

    return res.status(200).json({
      debug: true,
      team_id: teamId,
      raw_entry_count: entries.length,
      sample: entries.slice(0, 2),
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function getRange(range, customStart, customEnd) {
  const now = Date.now();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const weekday = today.getUTCDay() || 7;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - (weekday - 1));

  if (range === 'this_week') return { startMs: monday.getTime(), endMs: now };
  if (range === 'last_week') {
    const s = new Date(monday); s.setUTCDate(s.getUTCDate() - 7);
    const e = new Date(monday); e.setUTCSeconds(-1);
    return { startMs: s.getTime(), endMs: e.getTime() };
  }
  if (range === 'this_month') {
    const s = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    return { startMs: s.getTime(), endMs: now };
  }
  if (range === 'last_month') {
    const s = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    const e = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0, 23, 59, 59));
    return { startMs: s.getTime(), endMs: e.getTime() };
  }
  if (range === 'custom' && customStart && customEnd) {
    return { startMs: new Date(customStart).getTime(), endMs: new Date(customEnd).getTime() };
  }
  return { startMs: monday.getTime(), endMs: now };
}
