import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText)
  );

  console.log('Navigating...');
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Clicking the Admin login button...');
    
    // The text contains 'Admin', so we can search by text
    const buttons = await page.$$('button');
    if (buttons.length > 0) {
      await buttons[0].click();
      console.log('Button clicked! Waiting 2 seconds...');
      await new Promise(r => setTimeout(r, 2000));
    } else {
      console.log('No buttons found!');
    }
  } catch(e) {
    console.log('Navigation failed:', e.message);
  }
  
  await browser.close();
})();
