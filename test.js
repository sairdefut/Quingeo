const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  await page.goto('http://localhost');
  
  // Inject localStorage
  await page.evaluate(() => {
    localStorage.setItem('usuarioLogueado', JSON.stringify({
        idPersonal: 1,
        identificacion: "1234567890",
        nombres: "Admin",
        apellidos: "Admin",
        rol: "ADMIN",
        usuario: "root"
    }));
    localStorage.setItem('token', 'fake-token');
  });
  
  // Navigate to list
  await page.goto('http://localhost/pacientes/consulta');
  
  // Wait for table
  try {
    await page.waitForSelector('table', { timeout: 10000 });
    console.log('Table found.');
  } catch(e) {
    console.log('Table not found, waiting a bit...');
    await page.waitForTimeout(2000);
  }
  
  console.log('Clicking edit button...');
  // Find pencil button
  const buttons = await page.$$('button[title="Editar Paciente"]');
  if (buttons.length > 0) {
    await buttons[0].click();
    console.log('Button clicked.');
    await page.waitForTimeout(5000); // wait to see if it crashes and prints error
  } else {
    console.log('No edit button found');
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log('Body:', html.substring(0, 500));
  }

  await browser.close();
})();
