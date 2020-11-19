const tagsModule = {
    

    makeCardInDOM(cardId, cardName, backgroundColor, listId) {
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


        // 3. Je modifie le duplicata pour intégrer les données
        newCardNode.querySelector('.card-content').textContent = cardName;
        newCardNode.querySelector('[card-id]').setAttribute('card-id', cardId);
        newCardNode.querySelector('.box').style.backgroundColor = backgroundColor;
        newCardNode.querySelector('.fa-trash-alt').addEventListener('click', cardsModule.deleteCard);
        newCardNode.querySelector('.fa-pencil-alt').addEventListener('click', cardsModule.editCard);

        


        // 4. J'insère le duplicata dans le DOM
        document.querySelector(`div[list-id="${listId}"] .panel-block`).appendChild(newCardNode);
    },


};