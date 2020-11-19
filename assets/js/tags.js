const tagsModule = {
    
    showAddTagModal(event) {
        const modalNode =  document.getElementById('addTagModal');
        modalNode.classList.add('is-active');
        const addButton = event.target;
        const cardNode = addButton.closest('div[card-id]');
        const cardId = cardNode.getAttribute('card-id');
        modalNode.querySelector('input[type="hidden"]').value = cardId;
        },

        submitTagCreation(event) {
            event.preventDefault();
            const formData = new FormData(event.target);

            let cardId = event.target.querySelector('input[type="hidden"]').value;
            console.log('recup cardId du submit', cardId);

            tagsModule.sendCreateTagToAPI(formData, cardId);
            app.closeAllModal();
        },

        async sendCreateTagToAPI(tagFormData, cardId) {

            try {
                // fetch peut aussi faire des requêtes POST
                // fetch attend un second paramètre qui va concerner toutes les options
                // de la requêtes (methode, body, headers)
    
                const response = await fetch(`${app.BASE_URL}/tag`, {
                    method: 'POST',
                    // On peut envoyer directement un formData via fetch
                    // (express pourra le lire avec les bon middleware)
                    body: tagFormData
                });
    
                // Je vérifie le code retour de mon API pour être sur que
                // mon objet est bien créé
                if (response.status == 201) {
                    const newTagData = await response.json();
                    const newTag = newTagData.data;
                    const tagId = newTag.id
                    console.log("retour creation:", newTag)
                    //on associe à la card
                     const reponseAssociation = await fetch(`${app.BASE_URL}/${cardId}/tag/${tagId}`, {
                         method: 'PATCH'
                     });
                     if (reponseAssociation.status == 201) {
                        //recup la card pour afficher son tag
                        console.log('reponseOK!')
                        /* const cardNode = document.querySelector(`[card-id="${cardId}"]`);
                        let divTag = cardNode.querySelector('.tags');
                        divTag.classList.remove('is-hidden'); */
                        listsModule.getListsFromAPI();

                     }
 

                } else {
                    console.log('attendu 201, reçu :', response.status);
                }
            } catch (error) {
                console.log('error sending create card', error);
            }
        }
};