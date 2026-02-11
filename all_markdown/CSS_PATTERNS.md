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

<!-- Text Alignment -->
<p class="text-center">Centered text</p>
<p style="text-align: left;">Left aligned text</p>
<p style="text-align: right;">Right aligned text</p>

---

