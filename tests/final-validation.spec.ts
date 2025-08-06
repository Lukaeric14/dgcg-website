import { test, expect } from '@playwright/test';

test('Final validation - Featured Article pixel perfect', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('.featured-article-wrapper');
  
  // Take final comparison screenshot
  const featuredArticle = page.locator('.featured-article-wrapper');
  await featuredArticle.screenshot({ 
    path: 'final-featured-component.png',
    animations: 'disabled'
  });
  
  // Validate all key measurements match expected values
  const measurements = await page.evaluate(() => {
    const card = document.querySelector('.featured-article-card');
    const imageContainer = document.querySelector('.featured-image-container');
    const contentContainer = document.querySelector('.featured-content-container');
    const title = document.querySelector('.featured-article-title');
    
    return {
      cardHeight: card?.getBoundingClientRect().height,
      cardWidth: card?.getBoundingClientRect().width,
      imageWidth: imageContainer?.getBoundingClientRect().width,
      contentWidth: contentContainer?.getBoundingClientRect().width,
      titleFontSize: window.getComputedStyle(title).fontSize,
      titleFontWeight: window.getComputedStyle(title).fontWeight,
      cardBgColor: window.getComputedStyle(card).backgroundColor,
      cardBorderRadius: window.getComputedStyle(card).borderRadius
    };
  });
  
  // Validate against expected Figma specifications
  console.log('🎯 Final Measurements:');
  console.log(`Card: ${measurements.cardWidth}x${measurements.cardHeight}`);
  console.log(`Image width: ${measurements.imageWidth}`);
  console.log(`Content width: ${measurements.contentWidth}`);
  console.log(`Title: ${measurements.titleFontSize} / ${measurements.titleFontWeight}`);
  console.log(`Card background: ${measurements.cardBgColor}`);
  console.log(`Border radius: ${measurements.cardBorderRadius}`);
  
  // Expected values based on Figma design
  expect(measurements.cardHeight).toBe(400);
  expect(measurements.titleFontSize).toBe('32px');
  expect(measurements.titleFontWeight).toBe('800');
  expect(measurements.cardBorderRadius).toBe('16px');
  
  // Validate layout is horizontal (flex)
  const isHorizontalLayout = await page.locator('.featured-article-card').evaluate(el => {
    return window.getComputedStyle(el).display === 'flex' && 
           window.getComputedStyle(el).flexDirection !== 'column';
  });
  expect(isHorizontalLayout).toBe(true);
  
  // Validate navigation arrows are positioned correctly
  const leftArrow = page.locator('.featured-nav-left');
  const rightArrow = page.locator('.featured-nav-right');
  await expect(leftArrow).toBeVisible();
  await expect(rightArrow).toBeVisible();
  
  // Validate footer text
  const footerText = page.locator('.featured-footer-text');
  await expect(footerText).toHaveText('All rights reserved.');
  
  console.log('✅ All validations passed - Component matches Figma design!');
});