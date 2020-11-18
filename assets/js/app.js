
// on objet qui contient des fonctions
const app = {

  BASE_URL: 'http://localhost:3000',

  // fonction d'initialisation, lancée au chargement de la page
  init() {
    console.log('app.init !');

    // Je suis dans l'objet app. this fait donc référence à cet objet.
    // /!\ si j'avais fait une fonction flêchée this. aurait fait référence au contexte parent : window
    this.affectEvent();
    app.getListsFromAPI();
  },

  affectEvent() {
    document.getElementById('addListButton').addEventListener('click', app.showAddListModal);

    const closeButtons = document.querySelectorAll('.close');
    for (let button of closeButtons) {
      button.addEventListener('click', app.closeAllModal);
    }

    document.querySelector('#addListModal form').addEventListener('submit', app.submitListCreation);

    const addCardButtons = document.querySelectorAll('.add-card-button');
    for (let button of addCardButtons) {
      button.addEventListener('click', app.showAddCardModal);
    }

    document.querySelector('#addCardModal form').addEventListener('submit', app.submitCardCreation);

  },

  showAddListModal() {
    const modalNode = document.getElementById('addListModal');
    modalNode.classList.add('is-active');
  },

  closeAllModal() {
    const modalWindows = document.querySelectorAll('.modal');

    for (let modal of modalWindows) {
      modal.classList.remove('is-active');
    }
  },

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

  submitListCreation(event) {
    // J'intercepte la soumission du formulaire
    // Je veux
    // Bloquer le rechargement de la page
    event.preventDefault();

    // Extraire du formulaire les données intéréssante
    // Comme c'est mon <form> qui a  émis l'event je peux retrouver ma balise dans event.target
    const formData = new FormData(event.target);

    // Les objets formData on un méthode get qui permet de récupérer la valeur
    // d'un des champs du formulaire en donnant le "name" de ce champ
    const listName = formData.get('name');

    // Et les passer à makeListInDOM
    app.makeListInDOM(listName);

    app.closeAllModal();
  },

  submitCardCreation(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const cardName = formData.get('name');
    const listId = formData.get('list_id');

    app.makeCardInDOM(cardName, listId);

    app.closeAllModal();
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
    newListNode.querySelector('.add-card-button').addEventListener('click', app.showAddCardModal);
    newListNode.querySelector('[list-id]').setAttribute('list-id', listId);

    // 4. J'insère le duplicata dans le DOM
    document.querySelector('.card-lists').appendChild(newListNode);
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
        app.makeListInDOM(list.id, list.name, list.cardsList);

        // On pourrait aussi passer directement tt l'objet comme ceci
        // et utiliser list.id et list.name dans le code de makeListInDOM
        // app.makeListInDOM(list);

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
          app.makeCardInDOM(card.id, card.content, card.color, list.id)
        }
      }
    } catch (error) {
      console.log('Error fetching lists :', error);
    }
  }

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
// En JS lorsque l'on utilise une fonction comme callback son this peut être modifié.
// Ici ma méthode app.init sera appelé par la fonction addEventListener
// son this (à app.init) sera donc définit par la fonction addEventListener
// cette fonction donne au callback qu'elle appelle un this dépendant de l'évenement.
// Si je veux bloquer la redéfinition de this je dois appeler app.init depuis une fonction
// fléché
document.addEventListener('DOMContentLoaded', _ => {
  app.init();
});