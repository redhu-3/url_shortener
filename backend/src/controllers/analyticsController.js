
import Url from '../models/Url.js';
import Visit from '../models/Visit.js';

const getLocalDateString = (date, tz) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(new Date(date));
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    return `${year}-${month}-${day}`;
  } catch (e) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const parts = formatter.formatToParts(new Date(date));
      const year = parts.find(p => p.type === 'year').value;
      const month = parts.find(p => p.type === 'month').value;
      const day = parts.find(p => p.type === 'day').value;
      return `${year}-${month}-${day}`;
    } catch (err2) {
      return new Date(date).toISOString().slice(0, 10);
    }
  }
};

const buildDays = (tz, n = 30) => {
  const now = new Date();
  let year, month, day;

  const getParts = (timeZone) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    return {
      year: parseInt(parts.find(p => p.type === 'year').value, 10),
      month: parseInt(parts.find(p => p.type === 'month').value, 10),
      day: parseInt(parts.find(p => p.type === 'day').value, 10),
    };
  };

  try {
    const p = getParts(tz || 'UTC');
    year = p.year;
    month = p.month;
    day = p.day;
  } catch (e) {
    try {
      const p = getParts('UTC');
      year = p.year;
      month = p.month;
      day = p.day;
    } catch (err2) {
      const utcDate = now.toISOString().slice(0, 10).split('-');
      year = parseInt(utcDate[0], 10);
      month = parseInt(utcDate[1], 10);
      day = parseInt(utcDate[2], 10);
    }
  }

  return Array.from({ length: n }, (_, i) => {
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() - (n - 1 - i));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dateDay = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dateDay}`;
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

    const tz = req.query.tz || 'UTC';
    const days30 = buildDays(tz, 30);
    const clicksByDay = {};
    days30.forEach((d) => (clicksByDay[d] = 0));
    visits.forEach((v) => {
      const day = getLocalDateString(v.timestamp, tz);
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