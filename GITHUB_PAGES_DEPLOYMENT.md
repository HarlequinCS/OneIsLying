# GitHub Pages Deployment Guide

## One Is Lying - Production-Ready for GitHub Pages

This guide covers deploying and optimizing the One Is Lying game on GitHub Pages.

---

## ✅ Pre-Deployment Checklist

### SEO & Meta Tags
- [x] Complete meta tags (title, description, keywords)
- [x] Open Graph tags for social sharing
- [x] Twitter Card tags
- [x] Structured data (JSON-LD)
- [x] Canonical URLs pointing to `https://harlequincs.github.io/OneIsLying/`
- [x] robots.txt configured
- [x] sitemap.xml created

### Performance
- [x] Cache busting implemented (versioned assets: `?v=2.3.0`)
- [x] Lazy loading for images
- [x] Semantic HTML structure
- [x] Optimized asset paths

### GitHub Pages Specific
- [x] 404.html for error handling
- [x] _config.yml for Jekyll (optional, enables sitemap plugin)
- [x] Relative paths for assets
- [x] Base URL configured correctly

---

## 🚀 Deployment Steps

### 1. Repository Setup

1. **Create/Verify Repository**
   - Repository name: `OneIsLying`
   - Owner: `harlequincs`
   - Public repository (required for free GitHub Pages)

2. **Push Files to Repository**
   ```bash
   git init
   git add .
   git commit -m "Production-ready GitHub Pages deployment"
   git branch -M main
   git remote add origin https://github.com/harlequincs/OneIsLying.git
   git push -u origin main
   ```

### 2. Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
3. Click **Save**
4. GitHub Pages will be available at:
   `https://harlequincs.github.io/OneIsLying/`

### 3. Verify Deployment

**Check these URLs:**
- Main site: `https://harlequincs.github.io/OneIsLying/`
- 404 page: `https://harlequincs.github.io/OneIsLying/nonexistent`
- robots.txt: `https://harlequincs.github.io/OneIsLying/robots.txt`
- sitemap.xml: `https://harlequincs.github.io/OneIsLying/sitemap.xml`

**Test:**
- Game loads correctly
- All images display
- Sounds work (if available)
- Camera functionality (requires HTTPS - automatic on GitHub Pages)
- 404 page redirects properly

---

## 🔍 SEO Verification

### Google Search Console

1. **Add Property**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add property: `https://harlequincs.github.io/OneIsLying/`
   - Verify ownership (HTML tag or DNS)

2. **Submit Sitemap**
   - Go to **Sitemaps** section
   - Submit: `https://harlequincs.github.io/OneIsLying/sitemap.xml`

3. **Request Indexing**
   - Use **URL Inspection** tool
   - Request indexing for main page

### Validation Tools

**Test your SEO:**
- [Google Rich Results Test](https://search.google.com/test/rich-results) - Validate structured data
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - Test Open Graph
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Test Twitter Cards
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance check

---

## ⚡ Performance Optimization

### Cache Busting

**Current Implementation:**
- CSS: `styles.css?v=2.3.0`
- JS: `app.js?v=2.3.0`

**To Update Versions:**
1. Update `APP_VERSION` in `app.js`
2. Update version in `index.html` (CSS and JS links)
3. Commit and push

### Asset Optimization

**Images:**
- SVG logo is already optimized
- Favicons are provided
- Consider WebP format for future images

**CSS/JS:**
- Files are not minified (GitHub Pages serves as-is)
- Consider minification in build process if needed
- Current file sizes are reasonable for static hosting

### Lazy Loading

**Implemented:**
- Logo images use `loading="lazy"` (except first)
- Sounds loaded on demand
- Confetti elements pooled

---

## 🔐 Security & Best Practices

### HTTPS Enforcement

✅ **Automatic on GitHub Pages**
- All GitHub Pages sites use HTTPS
- HTTP automatically redirects to HTTPS
- HSTS headers included by GitHub

### Content Security Policy

**Note:** GitHub Pages doesn't support custom headers, but:
- HTTPS is enforced
- No external scripts loaded (all code is local)
- Camera API requires HTTPS (automatic)

### Subresource Integrity (SRI)

**Not needed** - All resources are:
- Hosted on same domain
- No external CDN dependencies
- No third-party scripts

---

## 📊 Monitoring & Analytics

### GitHub Pages Analytics (Built-in)

GitHub provides basic analytics:
- Repository → **Insights** → **Traffic**
- View page views and referrers

### Optional: Add Analytics

If desired, add to `index.html` before `</head>`:

```html
<!-- Google Analytics (optional) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Privacy Note:** Consider privacy-focused alternatives like Plausible Analytics.

---

## 🐛 Troubleshooting

### Issue: 404 Page Not Working

**Solution:**
- Ensure `404.html` is in root directory
- GitHub Pages automatically uses `404.html` for 404 errors
- May take a few minutes to propagate

### Issue: Assets Not Loading

**Solution:**
- Check paths are relative (not absolute)
- Verify files are committed to repository
- Clear browser cache
- Check GitHub Pages build logs

### Issue: Sitemap Not Found

**Solution:**
- Verify `sitemap.xml` is in root directory
- Check `_config.yml` includes sitemap plugin
- Or use Jekyll sitemap plugin (automatic with `_config.yml`)

### Issue: Canonical URLs Wrong

**Solution:**
- Update canonical URLs in `index.html`
- Ensure base URL matches your GitHub Pages URL
- Format: `https://harlequincs.github.io/OneIsLying/`

---

## 🔄 Update Process

### Making Updates

1. **Update Code**
   - Make changes locally
   - Test thoroughly

2. **Update Version**
   - Increment `APP_VERSION` in `app.js`
   - Update version in `index.html` (CSS/JS links)
   - Update `sitemap.xml` lastmod date

3. **Commit & Push**
   ```bash
   git add .
   git commit -m "Update: [description]"
   git push origin main
   ```

4. **Verify**
   - Wait 1-2 minutes for GitHub Pages to rebuild
   - Test on live site
   - Clear cache if needed (`Ctrl+Shift+R` or `Cmd+Shift+R`)

---

## 📝 File Structure

```
OneIsLying/
├── index.html          # Main HTML (SEO optimized)
├── 404.html            # Custom 404 page
├── app.js              # Game logic (v2.3.0)
├── styles.css          # Styles (v2.3.0)
├── robots.txt          # Search engine rules
├── sitemap.xml         # Site structure
├── _config.yml         # Jekyll config (optional)
├── favicon.ico         # Favicon
├── images/             # Images and icons
│   ├── gamelogo.svg
│   ├── favicon-*.png
│   └── site.webmanifest
├── sounds/             # Sound effects
└── README.md           # Documentation
```

---

## ✅ Production Checklist

Before going live, verify:

- [ ] All URLs point to correct GitHub Pages domain
- [ ] Canonical URLs are correct
- [ ] Open Graph images are accessible
- [ ] 404 page works
- [ ] robots.txt is accessible
- [ ] sitemap.xml is accessible
- [ ] Game functionality works on live site
- [ ] Camera works (requires HTTPS - automatic)
- [ ] Mobile responsive design works
- [ ] All assets load correctly
- [ ] No console errors
- [ ] Performance is acceptable

---

## 🎯 SEO Best Practices Applied

✅ **On-Page SEO**
- Semantic HTML (`<main>`, `<header>`, `<footer>`)
- Proper heading hierarchy
- Alt text for images
- Descriptive meta tags

✅ **Technical SEO**
- Canonical URLs
- robots.txt
- sitemap.xml
- Structured data (JSON-LD)

✅ **Social Sharing**
- Open Graph tags
- Twitter Cards
- Proper image dimensions

✅ **Performance**
- Cache busting
- Lazy loading
- Optimized assets
- Fast load times

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

**Last Updated:** 2025-12-30  
**Version:** 2.3.0  
**GitHub Pages URL:** `https://harlequincs.github.io/OneIsLying/`

