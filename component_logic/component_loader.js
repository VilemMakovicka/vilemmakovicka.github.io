const COMPONENTS = ['header', 'links', 'portfolio_main'];
const FOLDER_PATH = './components';

async function loadComponents() {
    const loaders = document.querySelectorAll('[data-component]');
    
    for (const loader of loaders) {
        const componentName = loader.getAttribute('data-component');
        
        try {
            const templateResponse = await fetch(`./components/${componentName}.html`);
            if (!templateResponse.ok) throw new Error(`HTTP error! status: ${templateResponse.status}`);
            const templateContents = await templateResponse.text();
            
            loader.outerHTML = templateContents;

            const parser = new DOMParser();
            const doc = parser.parseFromString(templateContents, 'text/html');
            const templateScripts = doc.querySelectorAll('script');
            
            templateScripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) newScript.src = oldScript.src; 
                else newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });

        } catch (error) {
            console.error(`Failed to load component: ${componentName}`, error);
        }
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);