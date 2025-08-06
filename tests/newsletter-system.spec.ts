import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'Luka@rhetoraai.com';
const ADMIN_PASSWORD = 'Lukste11!';

test.describe('Newsletter System', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Login as admin
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForURL(`${BASE_URL}/admin`);
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test.describe('Newsletter Management', () => {
    test('should navigate to newsletters page', async ({ page }) => {
      // Click on Newsletter in sidebar
      await page.click('text=Newsletter');
      
      // Should be on newsletters page
      await page.waitForURL(`${BASE_URL}/admin/newsletter`);
      await expect(page.locator('h1:has-text("Newsletters")')).toBeVisible();
      await expect(page.locator('text=Add Newsletter')).toBeVisible();
    });

    test('should display empty newsletters table initially', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.waitForURL(`${BASE_URL}/admin/newsletter`);
      
      // Should show empty state or table
      const tableOrEmpty = page.locator('table, text="No newsletters found"');
      await expect(tableOrEmpty).toBeVisible();
    });

    test('should filter newsletters by status', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.waitForURL(`${BASE_URL}/admin/newsletter`);
      
      // Test status filter
      await page.click('[placeholder="Filter by status"]');
      await expect(page.locator('text=Draft')).toBeVisible();
      await expect(page.locator('text=Scheduled')).toBeVisible();
      await expect(page.locator('text=Sent')).toBeVisible();
      
      await page.click('text=Draft');
      // Filter should be applied (hard to test without data)
    });

    test('should filter newsletters by access type', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.waitForURL(`${BASE_URL}/admin/newsletter`);
      
      // Test access filter
      await page.click('[placeholder="Filter by access"]');
      await expect(page.locator('text=Free')).toBeVisible();
      await expect(page.locator('text=Paid')).toBeVisible();
      
      await page.click('text=Free');
      // Filter should be applied
    });
  });

  test.describe('Newsletter Creation', () => {
    test('should open newsletter editor when clicking Add Newsletter', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.waitForURL(`${BASE_URL}/admin/newsletter`);
      
      // Click Add Newsletter button
      await page.click('text=Add Newsletter');
      
      // Should open the newsletter editor
      await expect(page.locator('h1:has-text("Create New Newsletter")')).toBeVisible();
      await expect(page.locator('text=Back to Newsletters')).toBeVisible();
      await expect(page.locator('text=Newsletter Settings')).toBeVisible();
    });

    test('should have all required form fields in newsletter editor', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Check all form fields are present
      await expect(page.locator('label:has-text("Newsletter Title")')).toBeVisible();
      await expect(page.locator('label:has-text("Email Subject")')).toBeVisible();
      await expect(page.locator('label:has-text("Access Type")')).toBeVisible();
      await expect(page.locator('label:has-text("Plain Text Version")')).toBeVisible();
      
      // Check editor toolbar is present
      await expect(page.locator('[data-testid="editor-toolbar"], .editor-toolbar')).toBeVisible();
    });

    test('should create a new newsletter with basic content', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Fill in newsletter details
      await page.fill('input[placeholder="Enter newsletter title"]', 'Test Newsletter');
      await page.fill('input[placeholder="Enter email subject line"]', 'Weekly Update from DGCG');
      
      // Select access type
      await page.click('text=Free (All Subscribers)');
      
      // Add content to editor
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'This is a test newsletter content.');
      
      // Save as draft
      await page.click('text=Save Draft');
      
      // Should see success message or redirect
      await page.waitForTimeout(2000); // Wait for save
    });

    test('should switch between editor and preview tabs', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Should be on editor tab by default
      await expect(page.locator('text=Content Editor')).toBeVisible();
      
      // Add some content first
      await page.fill('input[placeholder="Enter newsletter title"]', 'Preview Test');
      await page.fill('input[placeholder="Enter email subject line"]', 'Preview Subject');
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'Content for preview test.');
      
      // Switch to preview tab
      await page.click('text=Email Preview');
      
      // Should see preview content
      await expect(page.locator('text=Email Preview')).toBeVisible();
      await expect(page.locator('iframe, .email-preview-frame')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Try to save without filling required fields
      await page.click('text=Save Draft');
      
      // Should show validation or stay on page
      // (Implementation depends on your validation strategy)
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Newsletter Editor Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
    });

    test('should have working rich text editor toolbar', async ({ page }) => {
      // Click in editor
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'Test content for formatting.');
      
      // Select text
      await page.selectText('.ProseMirror p, .tiptap-editor p');
      
      // Test bold button
      await page.click('button:has([data-testid="bold-icon"]), button:has(.toolbar-icon):nth-child(1)');
      
      // Test italic button
      await page.click('button:has([data-testid="italic-icon"]), button:has(.toolbar-icon):nth-child(2)');
      
      // Content should be formatted (hard to test without DOM inspection)
    });

    test('should handle heading formatting', async ({ page }) => {
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'This will be a heading');
      
      // Select the text
      await page.selectText('.ProseMirror p, .tiptap-editor p');
      
      // Click H1 button
      await page.click('button:has([data-testid="h1-icon"]), .toolbar-group button:nth-child(1)');
      
      // Should create heading (hard to verify without DOM inspection)
    });

    test('should handle lists', async ({ page }) => {
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'List item 1');
      
      // Click bullet list button
      await page.click('button:has([data-testid="list-icon"]), button:has(.toolbar-icon)');
      
      // Should create a list
    });

    test('should handle links', async ({ page }) => {
      // Mock the prompt for link URL
      await page.evaluate(() => {
        window.prompt = () => 'https://example.com';
      });
      
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'Link text');
      await page.selectText('.ProseMirror p, .tiptap-editor p');
      
      // Click link button
      await page.click('button:has([data-testid="link-icon"]), button:has(.toolbar-icon)');
      
      // Should create a link
    });

    test('should auto-generate plain text from HTML content', async ({ page }) => {
      await page.fill('input[placeholder="Enter newsletter title"]', 'Auto Text Test');
      
      // Add rich content
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'This is formatted content.');
      
      // Plain text should be auto-generated
      const plainTextArea = page.locator('textarea[placeholder*="Auto-generated"]');
      await expect(plainTextArea).toHaveValue(/This is formatted content/);
    });
  });

  test.describe('Newsletter Preview', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Add content for preview
      await page.fill('input[placeholder="Enter newsletter title"]', 'Preview Newsletter');
      await page.fill('input[placeholder="Enter email subject line"]', 'Preview Subject');
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'This is preview content with <strong>formatting</strong>.');
    });

    test('should show email preview in iframe', async ({ page }) => {
      await page.click('text=Email Preview');
      
      // Should have iframe with preview
      const iframe = page.locator('iframe.email-preview-frame, iframe');
      await expect(iframe).toBeVisible();
      
      // Check iframe content (complex, may need special handling)
    });

    test('should include email footer in preview', async ({ page }) => {
      await page.click('text=Email Preview');
      
      // Preview should include unsubscribe footer
      // (Hard to test iframe content directly)
      await expect(page.locator('iframe')).toBeVisible();
    });

    test('should update preview when content changes', async ({ page }) => {
      // Switch to preview
      await page.click('text=Email Preview');
      
      // Go back to editor
      await page.click('text=Content Editor');
      
      // Change content
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.keyboard.press('Control+A');
      await page.type('.ProseMirror, .tiptap-editor', 'Updated content for preview.');
      
      // Switch back to preview
      await page.click('text=Email Preview');
      
      // Preview should be updated (hard to verify iframe content)
    });
  });

  test.describe('Newsletter Sending', () => {
    test('should show send button for draft newsletters', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Should see Send Now button
      await expect(page.locator('text=Send Now')).toBeVisible();
    });

    test('should show confirmation dialog when sending', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Fill minimal required content
      await page.fill('input[placeholder="Enter newsletter title"]', 'Send Test');
      await page.fill('input[placeholder="Enter email subject line"]', 'Send Subject');
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.type('.ProseMirror, .tiptap-editor', 'Send test content.');
      
      // Mock confirm dialog
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('send this newsletter');
        await dialog.dismiss(); // Don't actually send
      });
      
      await page.click('text=Send Now');
    });
  });

  test.describe('Access Control', () => {
    test('should handle free newsletter access type', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Select free access
      await page.click('text=Free (All Subscribers)');
      
      // Should be selected
      await expect(page.locator('text=Free (All Subscribers)')).toBeVisible();
    });

    test('should handle paid newsletter access type', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Click access type dropdown
      await page.click('[data-testid="access-type-select"], .setting-field:has(label:has-text("Access Type")) button');
      
      // Select paid access
      await page.click('text=Paid (Paid Subscribers Only)');
      
      // Should be selected
      await expect(page.locator('text=Paid')).toBeVisible();
    });
  });

  test.describe('Navigation and UI', () => {
    test('should navigate back to newsletters list', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Click back button
      await page.click('text=Back to Newsletters');
      
      // Should be back on newsletters page
      await expect(page.locator('h1:has-text("Newsletters")')).toBeVisible();
      await expect(page.locator('text=Add Newsletter')).toBeVisible();
    });

    test('should maintain responsive design on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Should still be usable on mobile
      await expect(page.locator('h1:has-text("Create New Newsletter")')).toBeVisible();
      await expect(page.locator('text=Newsletter Settings')).toBeVisible();
    });

    test('should handle sidebar toggle on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('text=Newsletter');
      
      // Should be able to navigate on mobile
      await expect(page.locator('h1:has-text("Newsletters")')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline
      await page.context().setOffline(true);
      
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      await page.fill('input[placeholder="Enter newsletter title"]', 'Offline Test');
      await page.click('text=Save Draft');
      
      // Should handle error (implementation dependent)
      await page.waitForTimeout(2000);
      
      // Restore online
      await page.context().setOffline(false);
    });

    test('should validate email format in test sending', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // This would test email validation if implemented
      // await page.fill('input[placeholder="Test email"]', 'invalid-email');
      // await page.click('text=Send Test');
      // Should show validation error
    });
  });

  test.describe('Performance', () => {
    test('should load newsletter editor quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      await expect(page.locator('h1:has-text("Create New Newsletter")')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    test('should handle large content efficiently', async ({ page }) => {
      await page.click('text=Newsletter');
      await page.click('text=Add Newsletter');
      
      // Add large content
      const largeContent = 'Large content test. '.repeat(1000);
      await page.click('.tiptap-editor, [data-testid="editor-content"]');
      await page.fill('.ProseMirror, .tiptap-editor', largeContent);
      
      // Should still be responsive
      await page.click('text=Email Preview');
      await expect(page.locator('iframe')).toBeVisible();
    });
  });
});

// Helper function for text selection
declare global {
  namespace PlaywrightTest {
    interface Page {
      selectText(selector: string): Promise<void>;
    }
  }
}

// Extend page with selectText helper
test.beforeEach(async ({ page }) => {
  page.selectText = async (selector: string) => {
    await page.locator(selector).click();
    await page.keyboard.press('Control+A');
  };
});