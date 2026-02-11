# 🎨 Modern CSS Patterns - Copy & Paste Guide

Use these patterns in your HTML files to create modern, consistent components.

---

## 🎯 Common Patterns

### 1. Modern Card
```html
<div class="card slide-up">
  <h2>📌 Card Title</h2>
  <p>Your content here...</p>
  <button class="btn">Action</button>
</div>
```

**Features**:
- Gradient top border on hover
- Lifts 4px on hover
- Smooth shadow transition
- Slide-up animation on load

---

### 2. Form Group
```html
<div style="display: flex; flex-direction: column; gap: 8px;">
  <label style="font-weight: 600; color: var(--text-primary); font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Label Text</label>
  <input type="text" placeholder="Placeholder text" style="padding: 12px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 15px; background: var(--bg-card); color: var(--text-primary); transition: all 0.3s ease;"/>
</div>
```

**Features**:
- Proper spacing
- Uppercase label with tracking
- Focus: Blue border + glow
- Hover: Lift effect

---

### 3. Button Variants

#### Primary Button
```html
<button class="btn">Primary Action</button>
```

#### Secondary Button
```html
<button class="btn btn-secondary">Secondary Action</button>
```

#### Success Button
```html
<button class="btn btn-success">✅ Confirm</button>
```

#### Danger Button
```html
<button class="btn btn-danger">❌ Delete</button>
```

---

### 4. Data Table
```html
<table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
      <td><button class="btn">View</button></td>
    </tr>
  </tbody>
</table>
```

**Features**:
- Gradient header
- Hover: Smooth background + scale
- Responsive on mobile

---

### 5. Alert Messages

#### Success Alert
```html
<div style="background: linear-gradient(135deg, var(--success) 0%, #27ae60 100%); color: white; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
  ✅ Operation completed successfully!
</div>
```

#### Warning Alert
```html
<div style="background: linear-gradient(135deg, var(--warning) 0%, #e67e22 100%); color: white; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
  ⚠️ Please review this information carefully.
</div>
```

#### Error Alert
```html
<div style="background: linear-gradient(135deg, var(--danger) 0%, #c0392b 100%); color: white; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
  ❌ An error occurred. Please try again.
</div>
```

---

### 6. Empty State
```html
<div style="text-align: center; padding: 40px; color: var(--text-light);">
  <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
  <h3 style="color: var(--text-primary); margin-bottom: 8px;">No Data Available</h3>
  <p>There are no items to display right now.</p>
</div>
```

---

### 7. Loading State
```html
<div style="text-align: center; padding: 20px; color: var(--text-light);">
  <p>⏳ Loading...</p>
</div>
```

---

### 8. Spacer Utilities
```html
<!-- Margin Bottom -->
<div class="mb-1">8px margin</div>
<div class="mb-2">16px margin</div>
<div class="mb-3">24px margin</div>

<!-- Margin Top -->
<div class="mt-1">8px margin</div>
<div class="mt-2">16px margin</div>
<div class="mt-3">24px margin</div>

<!-- Padding -->
<div class="p-1" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;">8px padding</div>
<div class="p-2" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;">16px padding</div>
<div class="p-3" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;">24px padding</div>
```

---

### 9. Text Utilities
```html
<!-- Text Alignment -->
<p class="text-center">Centered text</p>
<p style="text-align: left;">Left aligned text</p>
<p style="text-align: right;">Right aligned text</p>

<!-- Text Colors -->
<p class="text-muted">Muted gray text</p>
<p class="text-success">✅ Success message</p>
<p class="text-warning">⚠️ Warning message</p>
<p class="text-danger">❌ Error message</p>

<!-- Text Size -->
<p style="font-size: 12px;">Small text</p>
<p style="font-size: 14px;">Body text</p>
<p style="font-size: 18px;">Larger text</p>
<p style="font-size: 24px;">Title text</p>
```

---

### 10. Section with Header
```html
<div class="card">
  <h2>📊 Section Title</h2>
  <p class="small-text">Description or subtitle</p>
  
  <!-- Content here -->
  
</div>
```

---

## 🎯 Layout Patterns

### Two Column Layout (Desktop)
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
  <div class="card">Column 1</div>
  <div class="card">Column 2</div>
</div>

<style>
  @media (max-width: 768px) {
    div {
      grid-template-columns: 1fr !important;
    }
  }
</style>
```

### Card Grid
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### Flex Row
```html
<div style="display: flex; gap: 16px; align-items: center;">
  <button class="btn">Action 1</button>
  <button class="btn btn-secondary">Action 2</button>
</div>
```

---

## 🎨 Typography Patterns

### Page Title
```html
<h1 style="font-size: 32px; font-weight: 700; color: var(--primary); letter-spacing: -0.5px;">
  Page Title
</h1>
```

### Section Title
```html
<h2 style="font-size: 22px; font-weight: 700; color: var(--primary); letter-spacing: -0.5px;">
  Section Title
</h2>
```

### Subsection Title
```html
<h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.3px;">
  Subsection Title
</h3>
```

### Body Text
```html
<p style="font-size: 15px; color: var(--text-secondary); line-height: 1.7;">
  This is body text with proper line height for readability.
</p>
```

### Small/Muted Text
```html
<p class="small-text">
  This is smaller, muted text for secondary information.
</p>
```

### Label Text
```html
<label style="font-weight: 600; color: var(--text-primary); font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
  Label Text
</label>
```

---

## 🎯 Component Patterns

### Badge/Tag
```html
<span style="display: inline-block; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
  Badge
</span>
```

### Link
```html
<a href="#" style="color: var(--primary); text-decoration: none; font-weight: 600; transition: all 0.3s ease;">
  Click here
</a>

<style>
  a:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
</style>
```

### Divider
```html
<hr style="border: none; border-top: 1px solid var(--border); margin: 24px 0;" />
```

### Info Box
```html
<div style="background: rgba(0, 51, 160, 0.05); border-left: 4px solid var(--primary); padding: 16px; border-radius: 8px; margin: 16px 0;">
  <strong style="color: var(--primary);">ℹ️ Info:</strong>
  <p style="margin: 8px 0 0 0; color: var(--text-secondary);">This is helpful information.</p>
</div>
```

---

## 🌙 Dark Mode Patterns

All components automatically adjust to dark mode. To verify dark mode styling:

1. Click 🌙 button in header
2. Check if colors invert properly
3. Ensure text contrast is readable
4. Verify borders and shadows are visible

---

## 📱 Responsive Patterns

### Mobile Menu (Concept)
```html
<!-- For future mobile menu -->
<nav style="display: none; flex-direction: column;">
  <a href="#home">Home</a>
  <a href="#about">About</a>
</nav>

<style>
  @media (max-width: 768px) {
    nav {
      display: flex;
    }
  }
</style>
```

### Stacked on Mobile
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<style>
  @media (max-width: 480px) {
    div {
      grid-template-columns: 1fr !important;
    }
  }
</style>
```

---

## 💡 Pro Tips

1. **Always use `var(--primary)` instead of hardcoding colors** - Makes theme switching easy

2. **Use CSS variables for consistency**:
   ```css
   color: var(--text-primary);
   border: 1px solid var(--border);
   box-shadow: var(--shadow-md);
   ```

3. **Use transition variable for animations**:
   ```css
   transition: var(--transition); /* 0.3s cubic-bezier */
   ```

4. **Test in dark mode** - Every component should work in both light and dark modes

5. **Use proper spacing** - Follow 8px baseline:
   - 8px for small gaps
   - 16px for medium gaps
   - 24px for large gaps
   - 32px for section spacing

6. **Keep animations subtle** - 0.3s is optimal, not too fast or slow

7. **Use utility classes** - `.mb-2`, `.text-center`, `.small-text` for consistency

8. **Mobile first** - Design for mobile first, then enhance for larger screens

---

## 🎨 Copy-Paste Examples

### Modern Search Form
```html
<div style="display: flex; gap: 12px; margin-bottom: 20px;">
  <input type="text" placeholder="Search..." style="flex: 1; padding: 12px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 15px;"/>
  <button class="btn">🔍 Search</button>
</div>
```

### Status List
```html
<div class="card">
  <h2>📋 Status</h2>
  <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--border);">
    <span style="color: var(--text-secondary);">Item 1</span>
    <span class="text-success">✅ Active</span>
  </div>
  <div style="display: flex; justify-content: space-between; padding: 12px;">
    <span style="color: var(--text-secondary);">Item 2</span>
    <span class="text-danger">❌ Inactive</span>
  </div>
</div>
```

### Stats Card
```html
<div class="card">
  <p style="color: var(--text-light); font-size: 14px; margin-bottom: 8px;">Total Users</p>
  <h2 style="margin: 0; font-size: 32px; color: var(--primary);">1,234</h2>
  <p style="color: var(--text-light); font-size: 12px; margin-top: 8px;">↑ 12% from last month</p>
</div>
```

---

## 🚀 Template Summary

| Pattern | Best For | Dark Mode | Mobile |
|---------|----------|-----------|--------|
| Card | Content sections | ✅ | ✅ |
| Form Group | Input fields | ✅ | ✅ |
| Button | Actions | ✅ | ✅ |
| Table | Data display | ✅ | ⚠️ |
| Alert | Messages | ✅ | ✅ |
| Badge | Tags/labels | ✅ | ✅ |
| Divider | Visual separation | ✅ | ✅ |
| Grid | Layout | ✅ | ✅ |

---

**All patterns are tested and work with the modern CSS system!** 🎉
