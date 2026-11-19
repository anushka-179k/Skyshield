const km = (a, b) => {
  const r = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

function priority(s, now = Date.now()) {
  const waitMin = Math.min(60, (now - (s.createdAt || now)) / 60000);
  return Math.round(
    (s.severity || 1) * 10 +
      Math.min(s.people || 1, 50) * 0.5 +
      (s.vulnerable ? 15 : 0) +
      waitMin * 0.3 +
      Math.min(s.reportCount || 1, 20) * 0.5
  );
}

function allocate(requests, teams, shelters) {
  const free = [...teams];
  const beds = Object.fromEntries(shelters.map((s) => [s.id, s.bedsFree || 0]));
  const plan = [];

  const sorted = [...requests].sort((a, b) => priority(b) - priority(a));

  for (const r of sorted) {
    const fit = free.filter((t) => t.skills?.includes(r.need) || t.skills?.includes('general'));
    if (!fit.length) continue;

    const team = fit.reduce((a, b) => (km(a, r) <= km(b, r) ? a : b));
    const need = r.people || 1;
    const sh = shelters
      .filter((s) => beds[s.id] >= need)
      .sort((a, b) => km(r, a) - km(r, b))[0];

    free.splice(free.indexOf(team), 1);
    if (sh) beds[sh.id] -= need;

    plan.push({
      sosId: r.id,
      teamId: team.id,
      shelterId: sh ? sh.id : null,
      etaMin: Math.max(1, Math.round((km(team, r) / (team.speedKmh || 40)) * 60)),
      priority: priority(r),
    });
  }
  return plan;
}

module.exports = { km, priority, allocate };