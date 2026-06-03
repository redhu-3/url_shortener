import { useState } from 'react';
import { useUrls } from '../context/UrlContext';
import { RiCloseLine, RiFileCopyLine, RiCheckLine, RiStarFill, RiBarChartLine, RiLinkM } from 'react-icons/ri';
import './FavouritesDrawer.css';

const BASE = import.meta.env.VITE_API_URL || 'https://url-shortener-1-mxet.onrender.com';
const shortUrl = (url) => `${BASE}/${url.alias || url.shortCode}`;
const truncate = (s, n = 35) => s?.length > n ? s.slice(0, n) + '…' : s;

const getDomain = (urlStr) => {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return urlStr;
  }
};

export default function FavouritesDrawer({ isOpen, onClose }) {
  const { urls, toggleFavourite } = useUrls();
  const [copiedId, setCopiedId] = useState(null);

  const favouritedUrls = urls.filter((u) => u.isFavourite);

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <>
      {/* Overlay */}
      <div className={`fav-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      {/* Drawer */}
      <div className={`fav-drawer ${isOpen ? 'open' : ''}`}>
        <div className="fav-drawer-header">
          <div className="fav-drawer-title">
            <RiStarFill className="fav-star-icon" />
            <span>Favourites</span>
            <span className="fav-badge">{favouritedUrls.length}</span>
          </div>
          <button className="fav-drawer-close" onClick={onClose} aria-label="Close drawer">
            <RiCloseLine />
          </button>
        </div>

        <div className="fav-drawer-content">
          {favouritedUrls.length === 0 ? (
            <div className="fav-empty-state">
              <span className="fav-empty-icon">⭐</span>
              <h4>No favorites yet</h4>
              <p>Star your favorite short links on the dashboard to view them here.</p>
            </div>
          ) : (
            <div className="fav-list">
              {favouritedUrls.map((url) => {
                const link = shortUrl(url);
                return (
                  <div key={url._id} className="fav-item">
                    <div className="fav-item-main">
                      <div className="fav-item-details">
                        <a
                          className="fav-item-link"
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          /{url.alias || url.shortCode}
                        </a>
                        <span className="fav-item-domain" title={url.originalUrl}>
                          {truncate(getDomain(url.originalUrl))}
                        </span>
                      </div>

                      <div className="fav-item-stats">
                        <span className="fav-clicks" title="Total Clicks">
                          <RiBarChartLine /> {url.clickCount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="fav-item-actions">
                      {/* Copy action */}
                      <div style={{ position: 'relative' }}>
                        <button
                          className="fav-action-btn"
                          onClick={() => handleCopy(link, url._id)}
                          title="Copy Link"
                        >
                          {copiedId === url._id ? <RiCheckLine style={{ color: 'var(--emerald)' }} /> : <RiFileCopyLine />}
                        </button>
                        {copiedId === url._id && (
                          <div className="fav-copied-tooltip">
                            Copied!
                          </div>
                        )}
                      </div>

                      {/* Unfavourite action */}
                      <button
                        className="fav-action-btn unfav-btn"
                        onClick={() => toggleFavourite(url._id, true)}
                        title="Remove from Favourites"
                      >
                        <RiStarFill style={{ color: 'var(--amber)' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
