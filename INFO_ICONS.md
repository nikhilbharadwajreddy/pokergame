# Information Icons Implementation

This document explains the implementation of information icons (i-icons) throughout the Poker Settle application.

## IMPORTANT UPDATE: Class Name Change

The tooltip class has been renamed to `info-tooltip` to avoid conflicts with Bootstrap's tooltips. The following changes were made:

1. CSS class `.tooltip` changed to `.info-tooltip` in styles.css
2. All template references updated to use the new class name
3. JavaScript selectors updated in tooltips.js

## Overview

Information icons have been added to all key features in the app to provide context and explanation for users. These icons display tooltips when hovered on desktop and tapped on mobile devices.

## Template Organization

Each template or component that uses the info icon must import the macro at the top:

```html
{% from "components/info_icon.html" import render_info_icon %}
```

This is necessary because in Jinja2, imports in parent templates are not automatically available in included templates or components. Each component must explicitly import the macro.

## Components

### 1. CSS Styles

The styling for info icons and tooltips is defined in `static/css/styles.css`. Key features include:
- Tooltip positioning and appearance
- Hover and focus states for accessibility
- Mobile-specific styles
- Animation effects

### 2. JavaScript Functionality

The `static/js/tooltips.js` script manages the dynamic behavior of tooltips:
- Ensures tooltips remain visible within the viewport
- Special handling for mobile devices
- Touch event support for mobile 
- Keyboard accessibility (tab navigation)
- Proper dismissal behavior

### 3. Reusable Component

A Jinja2 macro has been created in `templates/components/info_icon.html` to easily add consistent info icons across the application:

```html
{% macro render_info_icon(tooltip_text, label) %}
<span class="info-tooltip">
    <i class="bi bi-info-circle info-icon" tabindex="0" role="button" aria-label="{{ label }}"></i>
    <span class="tooltip-text">{{ tooltip_text }}</span>
</span>
{% endmacro %}
```

## Usage

To add an info icon to any component:

1. Import the macro:
```html
{% from "components/info_icon.html" import render_info_icon %}
```

2. Use the macro with appropriate text and aria label:
```html
{{ render_info_icon('Explanation text here', 'Accessibility label here') }}
```

## Accessibility Features

The implementation includes:
- Keyboard focus support
- ARIA labels for screen readers
- Sufficient color contrast
- Touch target sizes for mobile
- Keyboard navigation and dismissal

## Mobile Considerations

Special handling for mobile devices includes:
- Larger touch targets
- Different positioning to ensure visibility
- Touch event handling
- Responsive tooltip width based on viewport
- Higher z-index to ensure visibility

## Pages with Info Icons

Info icons have been added to:
- Game screen (player form, group form, player table, settlement results)
- Dashboard (game list, settlement history, players, groups)
- Header component
