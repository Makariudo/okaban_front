const listsModule = {

    showAddListModal() {
        const modalNode = document.getElementById('addListModal');
        modalNode.classList.add('is-active');
    },

    showEditFormList(event) {

        // On veut afficher le formulaire pour changer le nom d'une liste

        // l'event est affecté au h2 (le titre)
        // je dois récupérer le parent qui contient toute la liste
        // querySelector ne permet que de "déscendre" (chercher dans les noeuds enfants)
        // pour remonter je dois utiliser closest
        const listNode = event.target.closest('[list-id]');

        // Maintenant que j'ai un point de départ je vais chercher le formulaire
        const formNode = listNode.querySelector('.edit-list-form');

        // Je "renomme" pour plus de clarté le noeud de mon titre
        const titleNode = event.target;

        // Je récupère le titre actuel de la liste
        const actualName = titleNode.textContent;
        // et je le place dans le champ du formulaire
        formNode.querySelector('input[name="name"]').value = actualName;

        // J'affiche le formulaire
        formNode.classList.remove('is-hidden');
        // Je cache le titre
        titleNode.classList.add('is-hidden');

    },

    submitListCreation(event) {
        // J'intercepte la soumission du formulaire
        // Je veux
        // Bloquer le rechargement de la page
        event.preventDefault();

        // Extraire du formulaire les données intéréssante
        // Comme c'est mon <form> qui a  émis l'event je peux retrouver ma balise dans event.target
        const formData = new FormData(event.target);
        console.log("submit list", event.target)

        // Les objets formData on un méthode get qui permet de récupérer la valeur
        // d'un des champs du formulaire en donnant le "name" de ce champ
        // const listName = formData.get('name');


        listsModule.sendCreateListToAPI(formData);

        app.closeAllModal();
    },

    submitListEdit(event) {
        // J'intercepte la soumission du formulaire
        // Je veux
        // Bloquer le rechargement de la page
        event.preventDefault();

        // Extraire du formulaire les données intéréssante
        // Comme c'est mon <form> qui a  émis l'event je peux retrouver ma balise dans event.target
        const formData = new FormData(event.target);


        const listNode = event.target.closest('[list-id]');
        const listId = listNode.getAttribute('list-id');


        listsModule.sendEditListToAPI(formData, listId);
    },

    makeListInDOM(listId, name) {
        // Pour utiliser les templates voici quelques étapes
        // 1. Je récupère mon noeud de template
        const template = document.getElementById('list-template');

        // 2. Je duplique mon noeud de template
        const newListNode = document.importNode(template.content, true);
        // /!\ Content renvoi tt ce qui est entre les deux balise template
        // PAS la première balise fille
        // La différence c'est que je vais récupérer un "Fragment de Document"
        // qui aura potentiellement des zone d'espace lié à mon indentation
        // ou mes retours à la ligne.
        // je dois donc faire un querySelector même pour la balise parente

        // 3. Je modifie le duplicata pour intégrer les données
        newListNode.querySelector('h2').textContent = name;
        newListNode.querySelector('h2').addEventListener('dblclick', listsModule.showEditFormList);

        newListNode.querySelector('.add-card-button').addEventListener('click', cardsModule.showAddCardModal);

        // Pour gérer l'edition on attache un écouter sur la SOUMISSION du formulaire
        newListNode.querySelector('.edit-list-form').addEventListener('submit', listsModule.submitListEdit);
        newListNode.querySelector('[list-id]').setAttribute('list-id', listId);

        // 4. J'insère le duplicata dans le DOM
        document.querySelector('.card-lists').appendChild(newListNode);
    },

    async getListsFromAPI() {
        try {

            // Pour faire une requête GET touteqs simple, la fonction fetch s'utilise comme ceci
            const response = await fetch(`${app.BASE_URL}/list`);

            // La réponse récupéré a une méthode json() QUI RENVOI UNE PROMESSE
            // A la résolution de cette promesse on obtient le corp de la requête
            // si c'était du JSON (envoyé via response.json() d'express)
            const listData = await response.json();

            // listData correspond à ce qui est renvoyé par l'API
            for (let list of listData.data) {
                listsModule.makeListInDOM(list.id, list.name, list.cardsList);

                // On pourrait aussi passer directement tt l'objet comme ceci
                // et utiliser list.id et list.name dans le code de makeListInDOM
                // listsModule.makeListInDOM(list);

                // Il  faut faire attention à l'ordre des chose.
                // dans makeCardInDOM je vais faire un querySelector
                // à la recherche de ma liste (pour ajouter ma carte dedans)
                // pour que qeurySelector fonctionne il faut que ma liste est déjà été
                // ajouter dans le DOM (appendChild)

                for (let card of list.cardsList) {

                    // Imaginons que j'ai un doute sur le nom de la propriété .content
                    // (je sais pas si c'est .content, .name, .title)
                    // Je peux soit :
                    // - ouvrir Insomnia et regarder
                    // - ouvrir mon controller dans mon projet et regarder
                    // - faire un console.log de card et regarder ce qui est à l'intérieur
                    cardsModule.makeCardInDOM(card.id, card.content, card.color, list.id)
                }
            }
        } catch (error) {
            console.log('Error fetching lists :', error);
        }
    },

    async sendCreateListToAPI(listFormData) {

        try {
            // fetch peut aussi faire des requêtes POST
            // fetch attend un second paramètre qui va concerner toutes les options
            // de la requêtes (methode, body, headers)

            const response = await fetch(`${app.BASE_URL}/list`, {
                method: 'POST',
                // On peut envoyer directement un formData via fetch
                // (express pourra le lire avec les bon middleware)
                body: listFormData
            });

            // Je vérifie le code retour de mon API pour être sur que
            // mon objet est bien créé
            if (response.status == 201) {
                const newListData = await response.json();
                const newList = newListData.data;
                listsModule.makeListInDOM(newList.id, newList.name);
            } else {
                console.log('attendu 201, reçu :', response.status);
            }
        } catch (error) {
            console.log('error sending create list', error);
        }
    },

    async sendEditListToAPI(listFormData, listId) {

        try {
            // fetch peut aussi faire des requêtes POST
            // fetch attend un second paramètre qui va concerner toutes les options
            // de la requêtes (methode, body, headers)

            const response = await fetch(`${app.BASE_URL}/list/${listId}`, {
                method: 'PATCH',
                // On peut envoyer directement un formData via fetch
                // (express pourra le lire avec les bon middleware)
                body: listFormData
            });

            // Je vérifie le code retour de mon API pour être sur que
            // mon objet est bien créé
            if (response.status == 200) {
                // Une fois ici je sais que ma requête à bien été validé.

                // Je dois donc metttre à jour le DOM
                // Changer le titre, cacher le form,...
                const listData = await response.json();
                const list = listData.data;

                // Je récupère la nouvelle info
                const newName = list.name;

                const listNode = document.querySelector(`[list-id="${listId}"]`);

                // Je cache le formulaire
                listNode.querySelector('.edit-list-form').classList.add('is-hidden');
                // J'affiche le titre
                listNode.querySelector('h2').classList.remove('is-hidden');
                // Je met à jour le titre
                listNode.querySelector('h2').textContent = newName;

            } else {
                console.log('attendu 200, reçu :', response.status);
            }
        } catch (error) {
            console.log('error sending create list', error);
        }
    },
};