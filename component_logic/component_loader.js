const components = ['header', 'links', 'portfolio_main'];
const folderPath = './components';

async function loadComponents() {
    // Find any element with a 'data-component' attribute
    const elements = document.querySelectorAll('[data-component]');
    
    for (const element of elements) {
        const componentName = element.getAttribute('data-component');
        
        try {
            const response = await fetch(`./components/${componentName}.html`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            
            element.outerHTML = html;

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const scripts = doc.querySelectorAll('script');
            
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.body.appendChild(newScript);
            });

        } catch (error) {
            console.error(`Failed to load component: ${componentName}`, error);
        }
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);