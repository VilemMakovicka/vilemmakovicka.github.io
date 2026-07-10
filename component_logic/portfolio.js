const containerName = "projects";

(
    async function loadProjects() {
        const container = document.getElementById(`${containerName}`);
        if (!container){
            console.error(`Could not load the \"${containerName}\" component!`);
            return;
        }

        container.innerHTML = "";

        try {
            const response = await fetch('/config/portfolio.jsonc');
            const portfolioConfig = await response.json();

            portfolioConfig.projects.forEach(item => {
                const projectContainer = document.createElement('div');
                projectContainer.style.backgroundImage = `url('${item.image}')`;
                projectContainer.addEventListener('click', () => {window.location.href = `${item.link}`; });

                const projectHeader    = document.createElement('h2');
                projectHeader.innerHTML = item.name;

                const projectDescription = document.createElement('a');
                projectDescription.innerHTML = `${item.description}`;

                projectContainer.appendChild(projectHeader);
                projectContainer.appendChild(projectDescription);

                container.appendChild(projectContainer);
            });
        } catch (err) {
            console.error("Failed to populate portfolio! ", err);
        }
    }
)();