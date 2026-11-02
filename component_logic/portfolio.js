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

                /* bottom bar */
                const source = item.source;
                const tags = item.tags;

                const projectBar = document.createElement('div');
                projectBar.classList.add("project-bar");

                if(source != undefined){
                    const projectSource = document.createElement('a');

                    projectSource.innerHTML = "source";
                    projectSource.href = source;
                    projectSource.classList.add("project-source");

                    projectBar.appendChild(projectSource);
                }

                if(tags != undefined && tags.length > 0){
                    tags.forEach(tag => {
                        var projectTag = document.createElement('a');
                        projectTag.innerHTML = tag;
                        projectTag.classList.add(`project-tag`);
                        projectTag.classList.add(`project-tag-${tag}`);
                        projectBar.appendChild(projectTag);
                    });
                }

                projectContainer.appendChild(projectBar);
                /* bottom bar end*/

                container.appendChild(projectContainer);
            });
        } catch (err) {
            console.error("Failed to populate portfolio! ", err);
        }
    }
)();