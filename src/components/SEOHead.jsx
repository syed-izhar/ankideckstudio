import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoForPath, generateJsonLd, SITE_URL } from '../config/seoConfig';

function updateMetaTag(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function updateJsonLd(data) {
  let script = document.getElementById('seo-jsonld');
  if (!script) {
    script = document.createElement('script');
    script.id = 'seo-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export default function SEOHead() {
  const location = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(location.pathname);
    const ogImage = `${SITE_URL}/og-image.png`;

    // Title
    document.title = seo.title;

    // Standard Meta
    updateMetaTag('name', 'description', seo.description);
    updateCanonical(seo.canonical);

    // Open Graph
    updateMetaTag('property', 'og:title', seo.title);
    updateMetaTag('property', 'og:description', seo.description);
    updateMetaTag('property', 'og:url', seo.canonical);
    updateMetaTag('property', 'og:type', seo.ogType || 'website');
    updateMetaTag('property', 'og:site_name', 'AnkiDeckStudio');
    updateMetaTag('property', 'og:image', ogImage);

    // Twitter
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', seo.title);
    updateMetaTag('name', 'twitter:description', seo.description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // JSON-LD Schema
    const jsonLd = generateJsonLd(seo);
    updateJsonLd(jsonLd);
  }, [location.pathname]);

  return null;
}
