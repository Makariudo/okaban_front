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
    

    deleteCard(event) {
        const trash = event.target;
        const cardNode = trash.closest('div[card-id]');
        const cardId = cardNode.getAttribute('card-id');
        console.log(cardId)
        cardsModule.deleteCardToAPI(cardId); 

    },

    submitCardEdit(event) {
        event.preventDefault();

        console.log("coucou de submit card edit");
        // J'intercepte la soumission du formulaire
        // Je veux
        // Bloquer le rechargement de la page

        // Extraire du formulaire les données intéréssante
        // Comme c'est mon <form> qui a  émis l'event je peux retrouver ma balise dans event.target
        const formData = new FormData(event.target);


        const cardNode = event.target.closest('[card-id]');
        const cardId = cardNode.getAttribute('card-id');


        cardsModule.sendEditCardToAPI(formData, cardId); 
    },
 

    showEditCard(event) {

        const cardNode = event.target.closest('[card-id]');

        const formNode = cardNode.querySelector('.edit-card-form');
        console.log(formNode);

        const titleNode = cardNode.querySelector('.card-content');
        console.log("titleNode :", titleNode);

        const actualName = titleNode.textContent;
        formNode.querySelector('input[name="content"]').value = actualName;

        formNode.classList.remove('is-hidden');
        titleNode.classList.add('is-hidden');
    },

    submitCardCreation(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        cardsModule.sendCreateCardToAPI(formData);

        app.closeAllModal();
    },

   

    makeCardInDOM(cardId, cardName, backgroundColor, listId, tagsList, position) {
        const template = document.getElementById('card-template');

        // 2. Je duplique mon noeud de template
        const newCardNode = document.importNode(template.content, true);
       
        //ecoute sur la poubelle de card
        let trash = newCardNode.querySelector('.fa-trash-alt');
        let trashSpan = trash.parentNode;
        trashSpan.addEventListener('click', cardsModule.deleteCard);
    
        //ecoute sur le pencil
        let pencil = newCardNode.querySelector('.fa-pencil-alt');
        let pencilSpan = pencil.parentNode;
        pencilSpan.addEventListener('click', cardsModule.showEditCard);

        //ecoute sur le submit de modif
        newCardNode.querySelector('.edit-card-form').addEventListener('submit', cardsModule.submitCardEdit);

        //ecoute sur le plus
        let plus = newCardNode.querySelector('.add-card-button');
        plus.addEventListener('click', tagsModule.showAddTagModal);


        // 3. Je modifie le duplicata pour intégrer les données
        //si tags je les affichent
        if (tagsList.length >= 1){
            for (let tag of tagsList){
                newCardNode.querySelector('.tags').textContent = tag.name;
            }
        } else {
            newCardNode.querySelector('.tags').classList.add('is-hidden');
        }
        newCardNode.querySelector('.card-content').textContent = cardName;
        newCardNode.querySelector('[card-id]').setAttribute('card-id', cardId);
        newCardNode.querySelector('[card-id]').setAttribute('position', position)
        newCardNode.querySelector('.box').style.backgroundColor = backgroundColor;
        newCardNode.querySelector('.fa-trash-alt').addEventListener('click', cardsModule.deleteCard);
        newCardNode.querySelector('.fa-pencil-alt').addEventListener('click', cardsModule.editCard);


        // 4. J'insère le duplicata dans le DOM
        document.querySelector(`div[list-id="${listId}"] .panel-block`).appendChild(newCardNode);
        cardsModule.addSortable(cardId);
    },

    addSortable(cardId) {
        const cardNode = document.querySelector(`[card-id="${cardId}"]`);
        new Sortable(cardNode.parentNode,{
            animation: 150,
            ghostClass:'sortable-ghost',
            group: 'shared-list',
            dataIdAttr: cardId,
            onEnd: cardsModule.updtatePosition
        })

        },

    updtatePosition(event){
        console.log("fin de drag:",event)
        var item1 = event.item;
        console.log("item 1", item1);
        console.log("from",event.from);
        console.log('to:', event.to);

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
    },
    async sendEditCardToAPI(cardFormData, cardId) {

        try {
            // fetch peut aussi faire des requêtes POST
            // fetch attend un second paramètre qui va concerner toutes les options
            // de la requêtes (methode, body, headers)

            const response = await fetch(`${app.BASE_URL}/card/${cardId}`, {
                method: 'PATCH',
                // On peut envoyer directement un formData via fetch
                // (express pourra le lire avec les bon middleware)
                body: cardFormData
            });

            // Je vérifie le code retour de mon API pour être sur que
            // mon objet est bien créé
            if (response.status == 200) {
                // Une fois ici je sais que ma requête à bien été validé.

                // Je dois donc metttre à jour le DOM
                // Changer le titre, cacher le form,...
                const cardData = await response.json();
                const card = cardData.data;

                // Je récupère la nouvelle info
                const newContent = card.content;

                const cardNode = document.querySelector(`[card-id="${cardId}"]`);
                console.log('cardNode', cardNode)
                // Je cache le formulaire
                cardNode.querySelector('.edit-card-form').classList.add('is-hidden');
                // J'affiche le titre
                cardNode.querySelector('.card-content').classList.remove('is-hidden');
                // Je met à jour le titre
                cardNode.querySelector('.card-content').textContent = newContent;
                cardNode.style.backgroundColor = card.color;


            } else {
                console.log('attendu 200, reçu :', response.status);
            }
        } catch (error) {
            console.log('error sending edit card', error);
        }
    },
    async deleteCardToAPI(cardId) {
        try {
            // fetch peut aussi faire des requêtes POST
            // fetch attend un second paramètre qui va concerner toutes les options
            // de la requêtes (methode, body, headers)

            const response = await fetch(`${app.BASE_URL}/card/${cardId}`, {
                method: 'DELETE'
            });

            // Je vérifie le code retour de mon API pour être sur que
            // mon objet est bien créé
            if (response.status == 200) {
                const cardNode = document.querySelector(`[card-id="${cardId}"]`);
                console.log('cardNode', cardNode)
                // Je delete le node du DOm
                cardNode.remove();

            } else {
                console.log('attendu 200, reçu :', response.status);
            }
        } catch (error) {
            console.log('error sending delete card', error);
        }
    }

};