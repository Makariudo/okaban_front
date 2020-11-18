const cardsModule = {
    showAddCardModal(event) {
        const modalNode = document.getElementById('addCardModal');
        modalNode.classList.add('is-active');

        // En plus d'afficher la modale je dois mettre à jour le list_id
        // pour savoir dans qu'elle liste je veux rajouter ma carte
        const addButton = event.target;
        // ici event.target correspond à mon boutton mais je cherche
        // une balise parente qui a l'attribut list-id
        // les querySelector servent à descendre la méthode closest elle sert à remonter
        const listNode = addButton.closest('div[list-id]');

        // Je peux donc récupérer la valeur et la mettre dans le input hidden
        const listId = listNode.getAttribute('list-id');
        modalNode.querySelector('input[type="hidden"]').value = listId;
    },

    submitCardCreation(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        cardsModule.sendCreateCardToAPI(formData);

        app.closeAllModal();
    },

    submitCardEdit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        cardsModule.sendCreateCardToAPI(formData);

        app.closeAllModal();
    },

    makeCardInDOM(cardId, cardName, backgroundColor, listId) {
        const template = document.getElementById('card-template');

        // 2. Je duplique mon noeud de template
        const newCardNode = document.importNode(template.content, true);

        // 3. Je modifie le duplicata pour intégrer les données
        newCardNode.querySelector('.card-content').textContent = cardName;
        newCardNode.querySelector('[card-id]').setAttribute('card-id', cardId);
        newCardNode.querySelector('.box').style.backgroundColor = backgroundColor;


        // 4. J'insère le duplicata dans le DOM
        document.querySelector(`div[list-id="${listId}"] .panel-block`).appendChild(newCardNode);
    },

    async sendCreateCardToAPI(cardFormData) {

        try {
            // fetch peut aussi faire des requêtes POST
            // fetch attend un second paramètre qui va concerner toutes les options
            // de la requêtes (methode, body, headers)

            const response = await fetch(`${app.BASE_URL}/card`, {
                method: 'POST',
                // On peut envoyer directement un formData via fetch
                // (express pourra le lire avec les bon middleware)
                body: cardFormData
            });

            // Je vérifie le code retour de mon API pour être sur que
            // mon objet est bien créé
            if (response.status == 201) {
                const newCardData = await response.json();
                const newCard = newCardData.data;
                cardsModule.makeCardInDOM(newCard.id, newCard.content, newCard.color, newCard.list_id);
            } else {
                console.log('attendu 201, reçu :', response.status);
            }
        } catch (error) {
            console.log('error sending create card', error);
        }
    }
};