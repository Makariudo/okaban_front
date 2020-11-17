
// on objet qui contient des fonctions
const app = {

  // fonction d'initialisation, lancée au chargement de la page
  init() {
    console.log('app.init !');

    // Je suis dans l'objet app. this fait donc référence à cet objet.
    // /!\ si j'avais fait une fonction flêchée this. aurait fait référence au contexte parent : window
    this.affectEvent();
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

  makeListInDOM(listName) {
    // Pour utiliser les templates voici quelques étapes
    // 1. Je récupère mon noeud de template
    const template = document.getElementById('list-template');

    // 2. Je duplique mon noeud de template
    const newListNode = document.importNode(template.content, true);

    // 3. Je modifie le duplicata pour intégrer les données
    newListNode.querySelector('h2').textContent = listName;
    newListNode.querySelector('.add-card-button').addEventListener('click', app.showAddCardModal);

    // 4. J'insère le duplicata dans le DOM
    document.querySelector('.card-lists').appendChild(newListNode);
  },

  makeCardInDOM(cardName, listId) {
    const template = document.getElementById('card-template');

    // 2. Je duplique mon noeud de template
    const newCardNode = document.importNode(template.content, true);

    // 3. Je modifie le duplicata pour intégrer les données
    newCardNode.querySelector('.card-content').textContent = cardName;

    // 4. J'insère le duplicata dans le DOM
    document.querySelector(`div[list-id="${listId}"] .panel-block`).appendChild(newCardNode);
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