// import { nanoid } from 'nanoid';
// import Url from '../models/Url.js';
// import Visit from '../models/Visit.js';
// import { isValidUrl } from '../utils/validateUrl.js';

// export const createUrl = async (req, res) => {
//   try {
//     const { originalUrl } = req.body;
//     if (!originalUrl) return res.status(400).json({ message: 'URL is required' });
//     if (!isValidUrl(originalUrl)) return res.status(400).json({ message: 'Invalid URL format' });

//     const shortCode = nanoid(7);
//     const url = await Url.create({ originalUrl, shortCode, userId: req.user.id });

//     res.status(201).json(url);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// export const getUserUrls = async (req, res) => {
//   try {
//     const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
//     res.json(urls);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// export const deleteUrl = async (req, res) => {
//   try {
//     const url = await Url.findById(req.params.id);
//     if (!url) return res.status(404).json({ message: 'URL not found' });
//     if (url.userId.toString() !== req.user.id)
//       return res.status(403).json({ message: 'Unauthorized' });

//     await Url.findByIdAndDelete(req.params.id);
//     await Visit.deleteMany({ urlId: req.params.id });
//     res.json({ message: 'URL deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// export const redirectUrl = async (req, res) => {
//   try {
//     const url = await Url.findOneAndUpdate(
//       { shortCode: req.params.shortCode },
//       { $inc: { clickCount: 1 } },
//       { new: true }
//     );
//     if (!url) return res.status(404).json({ message: 'Short URL not found' });

//     await Visit.create({
//       urlId: url._id,
//       ip: req.ip || req.connection.remoteAddress,
//       userAgent: req.headers['user-agent'] || 'unknown',
//     });

//     res.redirect(url.originalUrl);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

import { nanoid } from 'nanoid';
import Url from '../models/Url.js';
import Visit from '../models/Visit.js';
import { isValidUrl } from '../utils/validateUrl.js';
import { parseUserAgent } from '../utils/parseUA.js';
import { getGeoInfo } from '../utils/geoip.js';

/* ── helpers ── */
const RESERVED = ['api', 'login', 'register', 'dashboard', 'analytics', 'stats', 'admin'];

const isAliasValid = (alias) => /^[a-zA-Z0-9_-]{3,30}$/.test(alias);

/* ── CREATE (single) ── */
export const createUrl = async (req, res) => {
  try {
    const { originalUrl, alias, expiresAt, isPublic } = req.body;

    if (!originalUrl) return res.status(400).json({ message: 'URL is required' });
    if (!isValidUrl(originalUrl)) return res.status(400).json({ message: 'Invalid URL format' });

    // Alias validation
    if (alias) {
      if (!isAliasValid(alias))
        return res.status(400).json({ message: 'Alias must be 3-30 chars: letters, numbers, - or _' });
      if (RESERVED.includes(alias.toLowerCase()))
        return res.status(400).json({ message: 'That alias is reserved' });
      const exists = await Url.findOne({ $or: [{ shortCode: alias }, { alias }] });
      if (exists) return res.status(409).json({ message: 'Alias already taken' });
    }

   // const shortCode = nanoid(7);
let shortCode;
let exists;

do {
  shortCode = nanoid(7);
  exists = await Url.findOne({ shortCode });
} while (exists);

    const url = await Url.create({
      originalUrl,
      shortCode,
      ...(alias && {alias}),
      userId: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPublic: !!isPublic,
    });

    res.status(201).json(url);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Alias already taken' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── BULK CREATE via CSV array ── */
export const bulkCreateUrls = async (req, res) => {
  try {
    const { urls } = req.body; // [{ originalUrl, alias?, expiresAt? }]
    if (!Array.isArray(urls) || urls.length === 0)
      return res.status(400).json({ message: 'Provide a urls array' });
    if (urls.length > 100)
      return res.status(400).json({ message: 'Max 100 URLs per bulk request' });

    const results = [];
    for (const item of urls) {
      if (!item.originalUrl || !isValidUrl(item.originalUrl)) {
        results.push({ originalUrl: item.originalUrl, error: 'Invalid URL' });
        continue;
      }
      try {
        let alias = null;
        if (item.alias && isAliasValid(item.alias) && !RESERVED.includes(item.alias.toLowerCase())) {
          const exists = await Url.findOne({ $or: [{ shortCode: item.alias }, { alias: item.alias }] });
          if (!exists) alias = item.alias;
        }
        const doc = await Url.create({
          originalUrl: item.originalUrl,
          shortCode: nanoid(7),
          alias,
          userId: req.user.id,
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
          isPublic: false,
        });
        results.push({ originalUrl: item.originalUrl, shortCode: doc.shortCode, alias: doc.alias });
      } catch {
        results.push({ originalUrl: item.originalUrl, error: 'Failed to create' });
      }
    }

    res.status(201).json({ created: results.filter((r) => !r.error).length, results });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── LIST user URLs ── */
export const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── DELETE ── */
export const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ message: 'URL not found' });
    if (url.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    await Url.findByIdAndDelete(req.params.id);
    await Visit.deleteMany({ urlId: req.params.id });
    res.json({ message: 'URL deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── EDIT destination URL ── */
export const editUrl = async (req, res) => {
  try {
    const { originalUrl, expiresAt, isPublic, alias } = req.body;
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ message: 'URL not found' });
    if (url.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    if (originalUrl) {
      if (!isValidUrl(originalUrl)) return res.status(400).json({ message: 'Invalid URL format' });
      url.originalUrl = originalUrl;
    }
    if (expiresAt !== undefined) url.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isPublic !== undefined) url.isPublic = !!isPublic;

    if (alias !== undefined) {
      if (alias === null || alias === '') {
        url.alias = null;
      } else {
        if (!isAliasValid(alias))
          return res.status(400).json({ message: 'Invalid alias format' });
        if (alias !== url.alias) {
          const exists = await Url.findOne({ $or: [{ shortCode: alias }, { alias }], _id: { $ne: url._id } });
          if (exists) return res.status(409).json({ message: 'Alias already taken' });
          url.alias = alias;
        }
      }
    }

    await url.save();
    res.json(url);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Alias already taken' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── REDIRECT ── */
export const redirectUrl = async (req, res) => {
  try {
    const code = req.params.shortCode;

    // Look up by alias first, then shortCode
    const url = await Url.findOneAndUpdate(
      { $or: [{ alias: code }, { shortCode: code }] },
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!url) return res.status(404).send('Short URL not found');

    // Expiry check
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).send('This link has expired');
    }

    // Parse UA + get geo (non-blocking)
    const ua = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
    const referrer = req.headers.referer || req.headers.referrer || 'Direct';
    const { browser, os, device } = parseUserAgent(ua);

    getGeoInfo(ip).then(({ country, city }) => {
      Visit.create({ urlId: url._id, ip, userAgent: ua, browser, os, device, country, city, referrer }).catch(() => {});
    });

    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

/* ── PUBLIC STATS (no auth) ── */
export const getPublicStats = async (req, res) => {
  try {
    const code = req.params.shortCode;
    const url = await Url.findOne({
      $or: [{ alias: code }, { shortCode: code }],
      isPublic: true,
    }).select('-userId');

    if (!url) return res.status(404).json({ message: 'Not found or not public' });

    const visits = await Visit.find({ urlId: url._id }).sort({ timestamp: -1 });

    const buildDays = (n = 30) => {
      const now = new Date();
      return Array.from({ length: n }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (n - 1 - i));
        return d.toISOString().slice(0, 10);
      });
    };

    const countBy = (arr, key) => {
      const map = {};
      arr.forEach((v) => {
        const val = v[key] || 'Unknown';
        map[val] = (map[val] || 0) + 1;
      });
      return Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    };

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
      recentVisits: visits.slice(0, 20),
      chartData: {
        labels: days30,
        data: days30.map((d) => clicksByDay[d]),
      },
      breakdown: {
        browsers:  countBy(visits, 'browser'),
        os:        countBy(visits, 'os'),
        devices:   countBy(visits, 'device'),
        countries: countBy(visits, 'country'),
        referrers: countBy(visits, 'referrer'),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── PUBLIC LINKS (no auth) ── */
export const getPublicUrls = async (req, res) => {
  try {
    const urls = await Url.find({ isPublic: true })
      .select('-userId')
      .sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};