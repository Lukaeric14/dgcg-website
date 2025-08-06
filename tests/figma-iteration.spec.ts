import { test, expect } from '@playwright/test';

test('Iterative Figma comparison', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Wait for the featured article to load
  await page.waitForSelector('.featured-article-wrapper', { timeout: 10000 });
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'iteration-full-page.png',
    fullPage: true 
  });
  
  // Take focused screenshot of just the featured article
  const featuredArticle = page.locator('.featured-article-wrapper');
  await featuredArticle.screenshot({ 
    path: 'iteration-featured-component.png',
    animations: 'disabled'
  });
  
  // Measure dimensions
  const cardBox = await page.locator('.featured-article-card').boundingBox();
  const imageBox = await page.locator('.featured-image-container').boundingBox();
  const contentBox = await page.locator('.featured-content-container').boundingBox();
  
  console.log('📐 Component Measurements:');
  console.log(`Card: ${cardBox?.width}x${cardBox?.height}`);
  console.log(`Image: ${imageBox?.width}x${imageBox?.height}`);
  console.log(`Content: ${contentBox?.width}x${contentBox?.height}`);
  
  // Check computed styles
  const cardStyles = await page.locator('.featured-article-card').evaluate(el => {
    const styles = getComputedStyle(el);
    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      height: styles.height,
      display: styles.display
    };
  });
  
  const titleStyles = await page.locator('.featured-article-title').evaluate(el => {
    const styles = getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      color: styles.color,
      lineHeight: styles.lineHeight
    };
  });
  
  console.log('🎨 Current Styles:');
  console.log('Card:', cardStyles);
  console.log('Title:', titleStyles);
  
  // Take screenshot with different viewport sizes
  await page.setViewportSize({ width: 800, height: 600 });
  await featuredArticle.screenshot({ 
    path: 'iteration-800px.png',
    animations: 'disabled'
  });
  
  console.log('✅ Screenshots captured for comparison');
});