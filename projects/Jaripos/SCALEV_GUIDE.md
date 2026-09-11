# Landing Page Customization Guide (Jaripos)

This landing page was generated as a 100% standalone file and is ready for use on **Scalev** or any web hosting.

---

## Project Summary
- **Project Name**: Jaripos
- **Original Source URL**: https://jaripos.com/
- **Engine Used**: Dynamic Headless Browser (Puppeteer)
- **Placeholder Checkout Link**: `https://yourstore.myscalev.com/your-checkout`
- **Primary File**: `index.html` (All HTML + CSS bundled into 1 file)

---

## How to Install into Scalev
1. Open your **Scalev** dashboard -> Navigate to **Pages**.
2. Create or select the page you want to update.
3. Switch to the **HTML Mode** / **Custom Code** tab.
4. Open `index.html` in a text editor, copy all code (**Ctrl + A**, then **Ctrl + C**).
5. Paste (**Ctrl + V**) into the Scalev editor, then click **Save & Publish**.

---

## Important Customization Points
1. **Checkout / Order Link**:
   Search with **Ctrl + F** inside the editor for:
   ```
   https://yourstore.myscalev.com/your-checkout
   ```
   Replace it with your Scalev checkout link.

2. **Images & Banners**:
   Replace `src="..."` attribute values on `<img>` tags with your new image URLs.

3. **Countdown Timer**:
   Look for date variables at the bottom script section to configure promo deadlines.
