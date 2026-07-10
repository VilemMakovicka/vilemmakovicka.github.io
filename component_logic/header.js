(
    async function loadContents() {
        const container = document.getElementById('header');
        if (!container){
            console.error("Could not load the \"header\" component!");
            return;
        }

        try {
            const response = await fetch('/config/header.jsonc');
            const linkList = await response.json();

            container.innerHTML = "";

            linkList.forEach(item => {
                const a = document.createElement('a');
                a.href        = item.link;
                a.textContent = item.label;

                container.appendChild(a);
            });
        } catch (err) {
            console.error("Failed to populate the header! ", err);
        }
    }
)();