import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 10000 });
  
  await page.screenshot({ path: 'login.png' });
  
  const buttons = await page.$$('button');
  if (buttons.length > 0) {
    await buttons[0].click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'dashboard.png' });
  }
  
  await browser.close();
})();
