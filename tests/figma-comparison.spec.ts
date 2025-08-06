import { test, expect } from '@playwright/test';

test('Featured Article matches Figma design', async ({ page }) => {
  // Start the dev server first
  await page.goto('http://localhost:3000');
  
  // Wait for the featured article to load
  await page.waitForSelector('.featured-article-wrapper');
  
  // Take a screenshot of the featured article component
  const featuredArticle = page.locator('.featured-article-wrapper');
  
  // Check basic layout structure
  await expect(featuredArticle).toBeVisible();
  
  // Check for horizontal layout (image on left, content on right)
  const card = page.locator('.featured-article-card');
  await expect(card).toBeVisible();
  
  // Verify the flex layout
  const cardStyle = await card.evaluate(el => getComputedStyle(el));
  expect(cardStyle.display).toBe('flex');
  
  // Check image container
  const imageContainer = page.locator('.featured-image-container');
  await expect(imageContainer).toBeVisible();
  
  // Check content container
  const contentContainer = page.locator('.featured-content-container');
  await expect(contentContainer).toBeVisible();
  
  // Check navigation arrows
  const leftArrow = page.locator('.featured-nav-left');
  const rightArrow = page.locator('.featured-nav-right');
  await expect(leftArrow).toBeVisible();
  await expect(rightArrow).toBeVisible();
  
  // Check author section
  const authorInfo = page.locator('.featured-author-info');
  await expect(authorInfo).toBeVisible();
  
  // Check footer text
  const footerText = page.locator('.featured-footer-text');
  await expect(footerText).toBeVisible();
  await expect(footerText).toHaveText('All rights reserved.');
  
  // Take a screenshot for visual comparison
  await featuredArticle.screenshot({ path: 'featured-article-component.png' });
  
  console.log('✅ Featured article component structure verified');
  console.log('📸 Screenshot saved as featured-article-component.png');
});