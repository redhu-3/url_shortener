
import Url from '../models/Url.js';
import Visit from '../models/Visit.js';

const buildDays = (n = 30) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
};

const countBy = (visits, key) => {
  const map = {};
  visits.forEach((v) => {
    const val = v[key] || 'Unknown';
    map[val] = (map[val] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
};

export const getAnalytics = async (req, res) => {
  try {
    const url = await Url.findById(req.params.urlId);
    if (!url) return res.status(404).json({ message: 'URL not found' });
    if (url.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    const visits = await Visit.find({ urlId: url._id }).sort({ timestamp: -1 });

    const days30 = buildDays(30);
    const clicksByDay = {};
    days30.forEach((d) => (clicksByDay[d] = 0));
    visits.forEach((v) => {
      const day = new Date(v.timestamp).toISOString().slice(0, 10);
      if (clicksByDay[day] !== undefined) clicksByDay[day]++;
    });

    res.json({
      url,
      totalClicks: url.clickCount,
      lastVisited: visits[0]?.timestamp || null,
      recentVisits: visits.slice(0, 50),
      chartData: {
        labels: days30,
        data: days30.map((d) => clicksByDay[d]),
      },
      breakdown: {
        browsers:  countBy(visits, 'browser'),
        os:        countBy(visits, 'os'),
        devices:   countBy(visits, 'device'),
        countries: countBy(visits, 'country'),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};