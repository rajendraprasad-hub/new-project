# ⚡ Modern Portal Quick Reference

## Fast Access to Everything

---

## 🎨 CSS Variables

### Colors
```css
--primary: #0033a0           /* Main blue */
--primary-light: #1d47b6     /* Lighter blue */
--primary-dark: #001f6b      /* Darker blue */
--secondary: #007acc         /* Cyan */
--success: #2ecc71           /* Green */
--warning: #f39c12           /* Orange */
--danger: #e74c3c            /* Red */
--accent: #ff6b6b            /* Red accent */
```

### Backgrounds & Text
```css
--bg: #f8fafc                /* Page background */
--bg-card: #ffffff           /* Card background */
--text-primary: #1a202c      /* Main text */
--text-secondary: #4a5568    /* Secondary text */
--text-light: #8892a6        /* Muted text */
--border: #e0e7ff            /* Border color */
```

### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0,0,0,0.06)
--shadow-md: 0 4px 16px rgba(0,0,0,0.1)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12)
```

### Animations
```css
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🎯 Utility Classes

### Spacing - Margin Bottom
```html
<div class="mb-1">8px margin-bottom</div>
<div class="mb-2">16px margin-bottom</div>
<div class="mb-3">24px margin-bottom</div>
```

### Spacing - Margin Top
```html
<div class="mt-1">8px margin-top</div>
<div class="mt-2">16px margin-top</div>
<div class="mt-3">24px margin-top</div>
```

### Spacing - Padding
```html
<div class="p-1">8px padding</div>
<div class="p-2">16px padding</div>
<div class="p-3">24px padding</div>
```

### Text Classes
```html
<p class="text-center">Centered text</p>
<p class="text-muted">Muted gray text</p>
<p class="text-success">✅ Success text</p>
<p class="text-warning">⚠️ Warning text</p>
<p class="text-danger">❌ Danger text</p>
<p class="small-text">Small muted text</p>
```

### Animations
```html
<div class="fade-in">Fade in animation</div>
<div class="slide-up">Slide up animation</div>
```

---

## 🔘 Button Variants

```html
<!-- Primary -->
<button class="btn">Primary Button</button>

<!-- Secondary -->
<button class="btn btn-secondary">Secondary</button>

<!-- Success -->
<button class="btn btn-success">Success</button>

<!-- Danger -->
<button class="btn btn-danger">Danger</button>
```

---

## 🌙 Dark Mode

### How to Enable
Click the 🌙 button in the header - that's it!

### Force Dark Mode (JavaScript)
```javascript
document.body.classList.add('dark-mode');
localStorage.setItem('darkMode', 'enabled');
```

### Force Light Mode (JavaScript)
```javascript
document.body.classList.remove('dark-mode');
localStorage.setItem('darkMode', 'disabled');
```

---

## 📱 Responsive Breakpoints

### Desktop (Default)
```css
/* Styles for 1200px+ */
```

### Tablet
```css
@media (max-width: 768px) {
  /* Tablet styles */
}
```

### Mobile
```css
@media (max-width: 480px) {
  /* Mobile styles */
}
```

---

## 🎨 Common Components

### Card
```html
<div class="card slide-up">
  <h2>Title</h2>
  <p>Content...</p>
</div>
```

### Form Group
```html
<div style="display: flex; flex-direction: column; gap: 8px;">
  <label>Label</label>
  <input type="text" placeholder="Input..." />
</div>
```

### Alert
```html
<div style="background: linear-gradient(135deg, var(--success) 0%, #27ae60 100%); color: white; padding: 12px 16px; border-radius: 12px;">
  ✅ Success message
</div>
```

### Table
```html
<table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

---

## 💡 Tips & Tricks

### Use Variables Instead of Hardcoding Colors
```css
/* ✅ Good */
color: var(--primary);
border: 1px solid var(--border);

/* ❌ Bad */
color: #0033a0;
border: 1px solid #e0e7ff;
```

### Use Transition Variable
```css
/* ✅ Good */
transition: var(--transition);

/* ❌ Bad */
transition: all 0.3s ease;
```

### Mobile-First Media Queries
```css
/* Default: Mobile (480px) */
.card { padding: 16px; }

/* Then expand: Tablet */
@media (min-width: 768px) {
  .card { padding: 20px; }
}

/* Then expand: Desktop */
@media (min-width: 1200px) {
  .card { padding: 24px; }
}
```

### Proper Focus States
```css
input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 51, 160, 0.1);
}
```

---

## 📋 File Locations

| File | Purpose |
|------|---------|
| `/public/style.css` | All styling |
| `/public/index.html` | Home page |
| `/public/login.html` | Login page |
| `/public/change-password.html` | Password page |

---

## 🎯 Common Tasks

### Change Primary Color
1. Open `/public/style.css`
2. Find `:root { }`
3. Change `--primary: #0033a0`
4. All components auto-update ✨

### Add New Card
```html
<div class="card slide-up">
  <h2>📌 New Card</h2>
  <p>Your content...</p>
</div>
```

### Add Spacing Between Elements
```html
<div class="mb-2">Top element</div>  <!-- 16px margin-bottom -->
<div>Bottom element</div>
```

### Test Dark Mode
Press 🌙 in header to toggle

### Test Responsiveness
1. Open DevTools (F12)
2. Click device toolbar icon
3. Test at 768px (tablet) and 480px (mobile)

---

## ✅ Quality Checklist

- [ ] All pages look good
- [ ] Dark mode works (toggle 🌙)
- [ ] Responsive on mobile (480px)
- [ ] Responsive on tablet (768px)
- [ ] Buttons have hover effects
- [ ] Cards have animations
- [ ] Forms have focus states
- [ ] No broken images/links
- [ ] Text is readable
- [ ] Colors are consistent
- [ ] Spacing looks balanced
- [ ] Animations are smooth

---

## 📚 Documentation Files

| Document | Purpose |
|----------|---------|
| `DESIGN_IMPROVEMENTS.md` | Detailed upgrade guide |
| `VISUAL_PREVIEW.md` | Component showcase |
| `SETUP_GUIDE.md` | Implementation guide |
| `CSS_PATTERNS.md` | Copy-paste patterns |
| `BEFORE_AFTER_COMPARISON.md` | Visual comparison |
| `README-MODERN-DESIGN.md` | Complete summary |

---

**Keep this page handy for quick reference!** 🎯

---

## 🔧 Troubleshooting & More

**Troubleshooting & More:** See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for quick fixes and operational tips.
