(
    async function loadContents() {
        const container = document.getElementById('links');
        if (!container){
            console.error("Could not load the \"links\" component!");
            return;
        }

        try {
            const response = await fetch('/config/links.jsonc');
            const linkList = await response.json();

            container.innerHTML = "";

            linkList.forEach(item => {
                const a = document.createElement('a');
                a.href        = item.link;
                a.textContent = item.label;

                container.appendChild(a);
            });
        } catch (err) {
            console.error("Failed to populate the link list! ", err);
        }
    }
)();