import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import Url from '../models/Url.js';
import Visit from '../models/Visit.js';
import { isValidUrl } from '../utils/validateUrl.js';
import { parseUserAgent } from '../utils/parseUA.js';
import { getGeoInfo } from '../utils/geoip.js';

/* ── helpers ── */
const RESERVED = ['api', 'login', 'register', 'dashboard', 'analytics', 'stats', 'admin'];

const isAliasValid = (alias) => /^[a-zA-Z0-9_-]{3,30}$/.test(alias);

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

/* ── CREATE (single) ── */
export const createUrl = async (req, res) => {
  try {
    const { originalUrl, alias, expiresAt, isPublic } = req.body;

    if (!originalUrl) return res.status(400).json({ message: 'URL is required' });
    if (!isValidUrl(originalUrl)) return res.status(400).json({ message: 'Invalid URL format' });

    if (alias) {
      if (!isAliasValid(alias))
        return res.status(400).json({ message: 'Alias must be 3-30 chars: letters, numbers, - or _' });
      if (RESERVED.includes(alias.toLowerCase()))
        return res.status(400).json({ message: 'That alias is reserved' });
      const exists = await Url.findOne({ $or: [{ shortCode: alias }, { alias }] });
      if (exists) return res.status(409).json({ message: 'Alias already taken' });
    }

    let shortCode;
    let exists;
    do {
      shortCode = nanoid(7);
      exists = await Url.findOne({ shortCode });
    } while (exists);

    const url = await Url.create({
      originalUrl,
      shortCode,
      ...(alias && { alias }),
      userId: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPublic: !!isPublic,
    });

    const urlObj = url.toObject();
    res.status(201).json(urlObj);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Alias already taken' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── BULK CREATE via CSV array ── */
export const bulkCreateUrls = async (req, res) => {
  try {
    const { urls } = req.body;
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
        const docData = {
          originalUrl: item.originalUrl,
          userId: req.user.id,
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
          isPublic: false,
        };

        let shortCode;
        let codeExists;
        do {
          shortCode = nanoid(7);
          codeExists = await Url.findOne({ shortCode });
        } while (codeExists);
        docData.shortCode = shortCode;

        if (item.alias && isAliasValid(item.alias) && !RESERVED.includes(item.alias.toLowerCase())) {
          const aliasExists = await Url.findOne({ $or: [{ shortCode: item.alias }, { alias: item.alias }] });
          if (!aliasExists) {
            docData.alias = item.alias;
          }
        }

        const doc = await Url.create(docData);
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
    const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
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

/* ── EDIT ── */
export const editUrl = async (req, res) => {
  try {
    const { originalUrl, expiresAt, isPublic, alias, isFavourite } = req.body;
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
    if (isFavourite !== undefined) url.isFavourite = !!isFavourite;

    if (alias !== undefined) {
      if (alias === null || alias === '') {
        url.alias = undefined;
        await Url.updateOne({ _id: url._id }, { $unset: { alias: 1 } });
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
    const updated = await Url.findById(url._id).lean();
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Alias already taken' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── REDIRECT ── */
export const redirectUrl = async (req, res) => {
  try {
    const code = req.params.shortCode;
    const url = await Url.findOne({ $or: [{ alias: code }, { shortCode: code }] });

    if (!url) return res.status(404).send('Short URL not found');

    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).send('This link has expired');
    }

    url.clickCount += 1;
    await url.save();

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

/* ── PING HELPER ── */
const pingUrlHelper = async (urlStr) => {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(urlStr, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(id);
    const responseTime = Date.now() - startTime;
    const status = res.status;
    let resultStatus = 'dead';
    if (status >= 200 && status <= 399) {
      resultStatus = (status === 301 || status === 302) ? 'redirect' : 'live';
    }
    return { status: resultStatus, responseTime };
  } catch (err) {
    try {
      const startTimeGet = Date.now();
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(urlStr, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(id);
      const responseTime = Date.now() - startTimeGet;
      const status = res.status;
      let resultStatus = 'dead';
      if (status >= 200 && status <= 399) {
        resultStatus = (status === 301 || status === 302) ? 'redirect' : 'live';
      }
      return { status: resultStatus, responseTime };
    } catch (err2) {
      return { status: 'dead', responseTime: Date.now() - startTime };
    }
  }
};


/* ── PING HEALTH ── */
export const pingUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ message: 'URL not found' });
    if (url.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    const cacheDuration = 5 * 60 * 1000;
    if (
      url.pingResult &&
      url.pingResult.checkedAt &&
      (Date.now() - new Date(url.pingResult.checkedAt).getTime()) < cacheDuration
    ) {
      return res.json(url.pingResult);
    }

    const result = await pingUrlHelper(url.originalUrl);
    url.pingResult = {
      status: result.status,
      responseTime: result.responseTime,
      checkedAt: new Date(),
    };
    await url.save();

    res.json(url.pingResult);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
