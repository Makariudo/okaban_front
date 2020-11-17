
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

  makeListInDOM(listName) {

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